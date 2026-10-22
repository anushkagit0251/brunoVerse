package com.brunoverse.service;

import com.brunoverse.dto.AiAnalysisResponse;
import com.brunoverse.dto.LearningRecommendation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class AiRescueAssistantService {

    private static final Logger logger = LoggerFactory.getLogger(AiRescueAssistantService.class);

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Registry of verified learning articles from BrunoVerse learning catalog
    private static final Map<String, LearningRecommendation> LEARNING_CATALOG = new HashMap<>();

    static {
        LEARNING_CATALOG.put("fa-wound-care", new LearningRecommendation(
                "fa-wound-care",
                "Immediate Triage & Hemorrhage Control for Bleeding Wounds",
                "First Aid",
                "Master the principles of direct pressure, sterile bandaging, and shock management during animal trauma.",
                "Relevant for visible cuts, bleeding, and open surface trauma.",
                "/learning?topic=fa-wound-care",
                "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80"
        ));
        LEARNING_CATALOG.put("ar-transport-trauma", new LearningRecommendation(
                "ar-transport-trauma",
                "Field Stabilization & Safe Transport Protocol for Hit-and-Run Victims",
                "Animal Rescue",
                "Guidelines for spinal immobilization, improvised stretchers, and avoiding secondary injury during rescue transit.",
                "Crucial when animal is recumbent, suspected hit-and-run, or has limb immobility.",
                "/learning?topic=ar-transport-trauma",
                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80"
        ));
        LEARNING_CATALOG.put("ar-safe-capture", new LearningRecommendation(
                "ar-safe-capture",
                "Safe Capture & De-escalation Techniques for Injured Stray Animals",
                "Animal Rescue",
                "Protect both rescuer and animal using body language de-escalation, slip leashes, blankets, and safe containment.",
                "Essential when approaching frightened, unfamiliar, or pain-defensive animals.",
                "/learning?topic=ar-safe-capture",
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80"
        ));
        LEARNING_CATALOG.put("fa-heatstroke", new LearningRecommendation(
                "fa-heatstroke",
                "Heatstroke Emergency: Rapid Cooling Protocol & Vital Signs Monitoring",
                "First Aid",
                "Step-by-step emergency cooling instructions to prevent fatal multi-organ failure.",
                "Applicable for animals found panting heavily in extreme heat or unshaded areas.",
                "/learning?topic=fa-heatstroke",
                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80"
        ));
        LEARNING_CATALOG.put("ec-cpr-airway", new LearningRecommendation(
                "ec-cpr-airway",
                "Canine & Feline CPR: Compression Rates, Rescue Breathing & Airway Clearing",
                "Emergency Care",
                "The RECOVER initiative veterinary protocol for cardiopulmonary resuscitation and clearing obstructed airways.",
                "For unresponsive patients exhibiting respiratory arrest or airway obstruction.",
                "/learning?topic=ec-cpr-airway",
                "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80"
        ));
        LEARNING_CATALOG.put("ec-bloat-gdv", new LearningRecommendation(
                "ec-bloat-gdv",
                "Bloat & Gastric Dilatation-Volvulus (GDV): Minutes-Matter Emergency Intervention",
                "Emergency Care",
                "Recognize the sudden, fatal stomach twist affecting deep-chested breeds and the critical surgical window.",
                "Relevant for deep-chested dogs exhibiting swollen abdomen and dry retching.",
                "/learning?topic=ec-bloat-gdv",
                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80"
        ));
        LEARNING_CATALOG.put("cc-subtle-illness", new LearningRecommendation(
                "cc-subtle-illness",
                "Recognizing Silent Feline Distress & Chronic Kidney Disease Signs",
                "Cat Care",
                "Detect early subtle symptoms of renal failure, feline arthritis, and pain masking.",
                "Relevant when assessing distressed or neglected cats hiding or lethargic.",
                "/learning?topic=cc-subtle-illness",
                "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop&q=80"
        ));
    }

    public AiRescueAssistantService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String getEffectiveApiKey() {
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            return geminiApiKey.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.isBlank()) {
            return envKey.trim();
        }
        return null;
    }

    public boolean isConfigured() {
        String key = getEffectiveApiKey();
        return key != null && !key.isBlank() && !key.startsWith("placeholder");
    }

    /**
     * Inspects animal photograph using Google Gemini Vision API
     */
    public AiAnalysisResponse analyzeAnimalImage(byte[] imageBytes, String mimeType) {
        AiAnalysisResponse response = new AiAnalysisResponse();

        String apiKey = getEffectiveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            response.setSuccess(false);
            response.setConfigured(false);
            response.setErrorCode("GEMINI_KEY_NOT_CONFIGURED");
            response.setMessage("Google Gemini Vision API key (GEMINI_API_KEY) is not yet configured on the server. Please set GEMINI_API_KEY in your environment to enable real-time image analysis.");
            
            // Safe fallback recommendations so reporting is never blocked
            populateSafeFallback(response);
            return response;
        }

        response.setConfigured(true);

        try {
            String base64Data = Base64.getEncoder().encodeToString(imageBytes);

            String prompt = """
                    You are an expert veterinary triage and animal rescue assistant for the BrunoVerse platform.
                    Analyze this photograph of an animal in distress.
                    
                    STRICT RULES:
                    1. Do NOT make a definitive veterinary diagnosis or pretend to know medical history.
                    2. Describe only visible visual observations (apparent animal species, posture, visible lacerations, bleeding, swollen areas, abnormal limb position, surrounding environmental hazards).
                    3. Clearly identify uncertainties (e.g. internal injuries, severity, or exact cause cannot be verified from a single photo).
                    4. Generate a polite, natural, objective incident description for emergency rescuers.
                    5. Provide concise, safe on-scene guidance (e.g. avoid direct eye contact, do not move compromised spine, keep warm, do not give human medicines).
                    6. Select the most relevant BrunoVerse learning guide IDs from this list:
                       - "fa-wound-care" (if bleeding, cuts, open wounds)
                       - "ar-transport-trauma" (if recumbent, roadside, hit-and-run, limb injury)
                       - "ar-safe-capture" (if frightened, unfamiliar stray, defensive)
                       - "fa-heatstroke" (if panting heavily, heat exhaustion)
                       - "ec-cpr-airway" (if unresponsive, breathing difficulty)
                       - "cc-subtle-illness" (if lethargic or neglected cat)
                    7. Suggest apparent animal type (Dog, Cat, Cow, Bird, Buffalo, Other), urgency (CRITICAL, HIGH, MEDIUM, LOW), and condition category.
                    
                    OUTPUT FORMAT: Return strictly valid JSON with this exact structure:
                    {
                      "apparentAnimalType": "Dog",
                      "suggestedUrgency": "HIGH",
                      "suggestedCondition": "Injured / Bleeding",
                      "observations": ["observation 1", "observation 2"],
                      "uncertainties": ["uncertainty 1"],
                      "safetyGuidance": ["guidance 1", "guidance 2"],
                      "generatedDescription": "Comprehensive, natural description...",
                      "relevantLearningIds": ["fa-wound-care", "ar-transport-trauma"]
                    }
                    """;

            // Prepare Gemini REST API payload
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> inlineData = Map.of("mime_type", mimeType, "data", base64Data);
            Map<String, Object> imagePart = Map.of("inline_data", inlineData);

            Map<String, Object> contentObj = Map.of("parts", List.of(textPart, imagePart));
            Map<String, Object> genConfig = Map.of("response_mime_type", "application/json");

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(contentObj),
                    "generationConfig", genConfig
            );

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    geminiModel, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(45))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            logger.info("Calling Gemini Vision API ({}) for rescue photo analysis", geminiModel);
            HttpResponse<String> apiResponse = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (apiResponse.statusCode() >= 200 && apiResponse.statusCode() < 300 && apiResponse.body() != null) {
                JsonNode root = objectMapper.readTree(apiResponse.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    String jsonText = textNode.asText("");
                    
                    // Parse structured JSON
                    JsonNode parsed = objectMapper.readTree(jsonText);
                    response.setSuccess(true);
                    response.setApparentAnimalType(parsed.path("apparentAnimalType").asText("Dog"));
                    response.setSuggestedUrgency(parsed.path("suggestedUrgency").asText("HIGH"));
                    response.setSuggestedCondition(parsed.path("suggestedCondition").asText("Injured / Bleeding"));

                    List<String> obs = new ArrayList<>();
                    parsed.path("observations").forEach(n -> obs.add(n.asText()));
                    response.setObservations(obs);

                    List<String> unc = new ArrayList<>();
                    parsed.path("uncertainties").forEach(n -> unc.add(n.asText()));
                    response.setUncertainties(unc);

                    List<String> guide = new ArrayList<>();
                    parsed.path("safetyGuidance").forEach(n -> guide.add(n.asText()));
                    response.setSafetyGuidance(guide);

                    response.setGeneratedDescription(parsed.path("generatedDescription").asText(""));

                    List<String> learningIds = new ArrayList<>();
                    parsed.path("relevantLearningIds").forEach(n -> learningIds.add(n.asText()));
                    response.setRelevantLearningIds(learningIds);

                    // Attach verified learning recommendations
                    List<LearningRecommendation> recommendations = new ArrayList<>();
                    for (String lid : learningIds) {
                        LearningRecommendation rec = LEARNING_CATALOG.get(lid);
                        if (rec != null && recommendations.size() < 3) {
                            recommendations.add(rec);
                        }
                    }
                    if (recommendations.isEmpty()) {
                        recommendations.add(LEARNING_CATALOG.get("ar-safe-capture"));
                    }
                    response.setRecommendedLessons(recommendations);
                    response.setMessage("AI visual analysis completed successfully.");
                    return response;
                }
            }

            response.setSuccess(false);
            response.setErrorCode("AI_EMPTY_RESPONSE");
            response.setMessage("Gemini Vision returned an unparseable response (HTTP " + apiResponse.statusCode() + "). Please inspect the image manually.");
            populateSafeFallback(response);
            return response;

        } catch (Exception e) {
            logger.error("Failed to analyze image with Gemini Vision: {}", e.getMessage());
            response.setSuccess(false);
            response.setErrorCode("AI_SERVICE_ERROR");
            response.setMessage("AI image analysis encountered an issue: " + e.getMessage());
            populateSafeFallback(response);
            return response;
        }
    }

    private void populateSafeFallback(AiAnalysisResponse response) {
        response.setApparentAnimalType("Dog");
        response.setSuggestedUrgency("HIGH");
        response.setSuggestedCondition("Injured / Bleeding");
        response.setObservations(List.of(
                "Animal requires on-site welfare assessment.",
                "Visible distress reported by user."
        ));
        response.setUncertainties(List.of(
                "Visual analysis requires a clear image and active AI service.",
                "Internal health status must be verified by a veterinarian."
        ));
        response.setSafetyGuidance(List.of(
                "Maintain a safe distance and speak softly to avoid startling the animal.",
                "Do not attempt painful limb manipulation without professional rescue equipment.",
                "Contact a licensed veterinarian or registered local rescue NGO immediately."
        ));
        response.setGeneratedDescription("An animal has been reported in distress. Visible signs indicate potential trauma or immobility requiring veterinary triage. Please dispatch a trained rescuer or volunteer for on-site assessment.");
        response.setRelevantLearningIds(List.of("ar-safe-capture", "ar-transport-trauma"));
        response.setRecommendedLessons(List.of(
                LEARNING_CATALOG.get("ar-safe-capture"),
                LEARNING_CATALOG.get("ar-transport-trauma")
        ));
    }
}
