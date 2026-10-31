package com.brunoverse.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Emergency categorisation ("AI triage") for reported cases.
 * Rule-based and explainable: matches symptoms (English + Hinglish) to first-aid topics
 * and returns an urgency level. AI is a support layer, never a diagnosis.
 */
@Service
public class AiService {

    public record Topic(String id, String title, String level, List<String> keys, List<String> steps) {}

    public record Triage(String level, String label, List<Map<String, Object>> topics) {}

    private static final List<Topic> TOPICS = List.of(
        new Topic("bleeding", "Bleeding / Deep cut", "critical",
            List.of("bleed", "blood", "khoon", "cut\\b", "kat gaya", "wound", "ghav", "zakhm", "gash"),
            List.of("Press a clean cloth firmly on the wound for 5–10 minutes", "Add more cloth on top if it soaks through", "Keep the animal calm, still and warm", "Take it to a vet")),
        new Topic("accident", "Hit by vehicle / Accident", "critical",
            List.of("accident", "hit by", "by car", "car hit", "bike", "gaadi", "vehicle", "takkar", "run over", "truck"),
            List.of("Make the road safe first", "Slide a board/blanket under it to move it, keeping the back straight", "No food or water", "Emergency vet within the hour")),
        new Topic("fracture", "Broken bone / Limping", "urgent",
            List.of("fracture", "broken", "bone", "haddi", "toot", "limp", "langda", "cannot walk", "not walking"),
            List.of("Keep the animal still and confined", "Support the limb on a folded towel", "Don't try to set the bone", "Vet for X-ray")),
        new Topic("poison", "Poisoning", "critical",
            List.of("poison", "zeher", "zahar", "chocolate", "rat", "pesticide", "phenyl", "foam", "vomit", "ulti"),
            List.of("Move it away from the source", "Photo the packet/substance", "Don't induce vomiting", "Vet immediately")),
        new Topic("heat", "Heatstroke / Dehydration", "urgent",
            List.of("heat", "garmi", "panting", "dehydrat", "pyaas", "dhoop", "weak", "kamzor"),
            List.of("Move to shade", "Cool (not icy) water on neck, belly, paws", "Small sips of water", "Vet if no improvement in 10 min")),
        new Topic("seizure", "Fits / Seizure", "critical",
            List.of("seizure", "fit", "mirgi", "jhatke", "convuls"),
            List.of("Clear the area", "Don't hold it or touch the mouth", "Time the seizure", "Emergency if over 5 minutes")),
        new Topic("breathing", "Choking / Breathing trouble", "critical",
            List.of("chok", "breath", "saans", "gasp", "not breathing"),
            List.of("Check the mouth, remove visible object only if easy", "Back blows / abdominal thrusts", "Rush to a vet")),
        new Topic("unconscious", "Unconscious", "critical",
            List.of("unconscious", "behosh", "not moving", "collapsed", "not responding"),
            List.of("Check breathing", "Lay on right side, clear the mouth", "CPR 30 compressions : 2 breaths", "Go to a vet now")),
        new Topic("burn", "Burns", "urgent",
            List.of("burn", "jal gaya", "jala", "fire", "aag", "acid", "patakha"),
            List.of("Cool running water 10–20 min", "Cover with clean damp cloth", "No ice, oil or butter")),
        new Topic("maggot", "Maggot wound", "urgent",
            List.of("maggot", "keede", "kide", "infested", "rotting"),
            List.of("Keep flies away – cover the wound", "Never pour kerosene/phenyl", "Vet cleaning the same day")),
        new Topic("snake", "Snake bite", "critical",
            List.of("snake", "saanp", "saap", "naag"),
            List.of("Keep it still", "Carry it – don't let it walk", "No cutting, sucking or tourniquet", "Vet with anti-venom")),
        new Topic("eye", "Eye injury / infection", "urgent",
            List.of("eye", "aankh", "discharge", "pus"),
            List.of("Stop it rubbing the eye", "Clean with cotton + lukewarm water", "No human eye drops")),
        new Topic("baby", "Abandoned puppies / kittens", "moderate",
            List.of("puppies", "puppy", "kitten", "bachche", "abandoned", "newborn"),
            List.of("Watch 1–2 hours for the mother", "Keep them warm first", "No cow's milk", "Call a shelter for fostering")),
        new Topic("hungry", "Weak / Hungry stray", "moderate",
            List.of("hungry", "bhook", "starving", "not eating", "khana", "food"),
            List.of("Water first", "Small portions of plain soft food", "No chocolate, onion, grapes, spicy food")),
        new Topic("bird", "Injured bird", "moderate",
            List.of("bird", "pigeon", "kabootar", "parrot", "crow", "kite", "manjha"),
            List.of("Box with air holes, dark and quiet", "Don't force food or water", "Contact a bird rescuer"))
    );

    private static final Map<String, Integer> RANK = Map.of("critical", 3, "urgent", 2, "moderate", 1);

    public Triage triage(String text) {
        String t = text == null ? "" : text.toLowerCase(Locale.ROOT);
        List<Map.Entry<Topic, Integer>> scored = new ArrayList<>();
        for (Topic topic : TOPICS) {
            int score = 0;
            for (String k : topic.keys()) {
                if (Pattern.compile("(^|[^a-z])" + k).matcher(t).find()) score += k.length() > 4 ? 2 : 1;
            }
            if (score > 0) scored.add(Map.entry(topic, score));
        }
        scored.sort((a, b) -> b.getValue() - a.getValue());

        String level = "moderate";
        List<Map<String, Object>> topics = new ArrayList<>();
        for (Map.Entry<Topic, Integer> e : scored) {
            Topic tp = e.getKey();
            if (RANK.get(tp.level()) > RANK.get(level)) level = tp.level();
            if (topics.size() < 3) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", tp.id());
                m.put("title", tp.title());
                m.put("level", tp.level());
                m.put("steps", tp.steps());
                topics.add(m);
            }
        }
        String label = switch (level) {
            case "critical" -> "Critical – needs help within minutes";
            case "urgent" -> "Urgent – needs help within hours";
            default -> "Moderate – needs help today";
        };
        return new Triage(level, label, topics);
    }

    /** One-line summary shown to rescuers and vets. */
    public String summary(String animal, String text, String address) {
        Triage tr = triage(text);
        StringBuilder needs = new StringBuilder();
        for (Map<String, Object> m : tr.topics()) {
            if (needs.length() > 0) needs.append(", ");
            needs.append(m.get("title"));
        }
        return (animal == null ? "Animal" : animal) + " • " + tr.label() + ". Likely needs: "
                + (needs.length() == 0 ? "General care" : needs) + ". Location: " + (address == null || address.isBlank() ? "shared GPS location" : address) + ".";
    }
}
