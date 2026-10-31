/* =========================================================
   BrunoVerse AI — Emergency first-aid assistant & case triage
   Works fully offline with a built-in vet-reviewed-style knowledge base.
   Optional: add a Google Gemini API key in Settings for free-form answers.
   AI is a SUPPORT LAYER, never a replacement for a veterinarian.
   ========================================================= */

const SAFETY = [
  'Approach slowly from the side, talk softly, avoid direct eye contact.',
  'Hurt animals may bite out of fear — use a towel/dupatta/jacket between your hands and the animal.',
  'If you get bitten or scratched: wash the wound with soap + running water for 15 minutes and get an anti-rabies vaccine the same day.',
  'Stay off the road — ask someone to stop/divert traffic before you step in.',
];

const FIRST_AID = [
  { id: 'bleeding', title: 'Bleeding / Deep cut', emoji: '🩸', level: 'critical',
    keys: ['bleed', 'blood', 'khoon', 'cut\\b', 'kat gaya', 'wound', 'ghav', 'zakhm', 'gash'],
    steps: ['Take a clean cloth, gauze or even a clean handkerchief.', 'Press it FIRMLY on the wound and hold for 5–10 minutes without lifting to check.', 'If blood soaks through, put another cloth on top — do not remove the first one.', 'If it is a leg and nothing seems broken, gently raise it above heart level.', 'Wrap a bandage/cloth around to keep pressure — snug, but you should fit one finger under it.', 'Keep the animal calm, still and warm; arrange transport to a vet.'],
    donts: ['Don’t put turmeric, toothpaste, coffee powder or chilli on deep wounds.', 'Don’t tie a tight tourniquet unless you are trained.', 'Don’t pull out objects stuck in the wound — pad around them.'],
    vet: 'Go to a vet NOW if blood is spurting, gums look pale/white, or bleeding does not slow after 10 minutes of pressure.' },
  { id: 'accident', title: 'Hit by vehicle / Accident', emoji: '🚗', level: 'critical',
    keys: ['accident', 'hit by', 'by car', 'car hit', 'car accident', 'bike', 'gaadi', 'vehicle', 'road', 'takkar', 'run over', 'truck'],
    steps: ['Make the road safe first — warn traffic, use hazard lights/phone torch.', 'Slide a flat board, cardboard or blanket under the animal like a stretcher, keeping its back straight.', 'Move it gently to the roadside/shade with 2 people if possible.', 'Press on any bleeding area with a clean cloth.', 'Keep it warm with a cloth and talk calmly — shock is common.', 'Note the time and go to an emergency vet; internal injuries may not be visible.'],
    donts: ['Don’t lift by the legs or neck.', 'Don’t give food or water (it may need surgery).', 'Don’t try to straighten bent limbs.'],
    vet: 'Every road accident needs a vet check within the hour, even if the animal walks away.' },
  { id: 'fracture', title: 'Broken bone / Limping', emoji: '🦴', level: 'urgent',
    keys: ['fracture', 'broken', 'bone', 'haddi', 'toot', 'limp', 'langda', 'leg', 'paw', 'swollen leg', 'cannot walk', 'not walking'],
    steps: ['Keep the animal as still as possible and confine it in a box/small space.', 'Support the hurt limb on a folded towel — do not move it around.', 'For open fractures (bone visible) cover loosely with a clean damp cloth.', 'Carry the animal with the injured side up on a flat surface.', 'Take it to a vet for an X-ray.'],
    donts: ['Don’t try to set or splint the bone yourself unless trained.', 'Don’t let it jump or run.', 'Don’t give human painkillers (paracetamol/ibuprofen are toxic to pets).'],
    vet: 'Within a few hours — sooner if there is bleeding or bone is visible.' },
  { id: 'poison', title: 'Poisoning', emoji: '☠️', level: 'critical',
    keys: ['poison', 'zeher', 'zahar', 'chocolate', 'rat', 'pesticide', 'phenyl', 'foam', 'vomit', 'ulti', 'grapes', 'xylitol', 'medicine eaten'],
    steps: ['Move the animal away from the source immediately.', 'Take a photo of the packet/plant/substance or bring it along.', 'If chemical is on the fur/skin, rinse with lots of plain lukewarm water (wear gloves).', 'Keep the animal calm and warm and go to a vet immediately.', 'Note the time and how much was eaten.'],
    donts: ['Don’t make it vomit unless a vet tells you to — some poisons burn twice.', 'Don’t give milk, oil, salt or home remedies.'],
    vet: 'Emergency — go now. Seizures, drooling, foaming or collapse mean every minute matters.' },
  { id: 'heat', title: 'Heatstroke / Dehydration', emoji: '🔥', level: 'urgent',
    keys: ['heat', 'garmi', 'hot\\b', 'panting', 'hanf', 'dehydrat', 'thirst', 'pyaas', 'sun\\b', 'dhoop', 'weak', 'kamzor', 'collapsed in sun'],
    steps: ['Move it to shade or a cool room immediately.', 'Pour cool (NOT ice-cold) water over the neck, belly, armpits and paws.', 'Use a fan or wave a cloth to increase air flow.', 'Offer small sips of clean water — don’t force it.', 'Keep cooling until breathing calms, then take it to a vet.'],
    donts: ['Don’t use ice or ice-cold water (causes shock).', 'Don’t cover with a wet towel for long — it traps heat.'],
    vet: 'If it collapses, vomits, has bright red/blue gums or does not improve in 10 minutes.' },
  { id: 'seizure', title: 'Fits / Seizure', emoji: '⚡', level: 'critical',
    keys: ['seizure', 'fit', 'mirgi', 'shaking', 'jhatke', 'convuls', 'twitch', 'kaanp'],
    steps: ['Move furniture/objects away so it cannot hurt itself.', 'Dim the lights and keep noise low.', 'Time the seizure with your phone.', 'After it stops, keep it warm and quiet and speak softly.', 'Record a short video for the vet if you can.'],
    donts: ['Don’t hold the animal down.', 'Don’t put your hand or anything in its mouth — it cannot swallow its tongue.'],
    vet: 'Emergency if it lasts over 5 minutes, or 2+ seizures happen in a row.' },
  { id: 'choking', title: 'Choking / Breathing trouble', emoji: '😮‍💨', level: 'critical',
    keys: ['chok', 'breath', 'saans', 'gasp', 'stuck in throat', 'gale', 'cough', 'blue tongue', 'not breathing'],
    steps: ['Open the mouth gently and look — remove a visible object with fingers only if it comes out easily.', 'Small dog/cat: hold it with head down and give 5 firm back blows between the shoulder blades.', 'Large dog: stand behind, fist just below the rib cage, give 5 quick inward-upward thrusts.', 'Check the mouth again; repeat back blows + thrusts.', 'Rush to a vet even if the object comes out.'],
    donts: ['Don’t blindly push fingers down the throat.', 'Don’t pull on a string/thread seen in the mouth.'],
    vet: 'Immediately — breathing problems are life-threatening.' },
  { id: 'unconscious', title: 'Unconscious / Not responding', emoji: '💔', level: 'critical',
    keys: ['unconscious', 'behosh', 'not moving', 'collapsed', 'gir gaya', 'no heartbeat', 'dead', 'not responding', 'lifeless'],
    steps: ['Check breathing: watch the chest or hold a phone screen near the nose for fog.', 'Lay it on its right side, pull the tongue gently forward, clear the mouth.', 'If not breathing: close the mouth and give 2 gentle breaths into the nose.', 'If no heartbeat: press the widest part of the chest 30 times, fast (100–120/min), then 2 breaths. Repeat.', 'Keep going while someone drives to the vet.'],
    donts: ['Don’t waste time — call a vet/rescuer while you help.'],
    vet: 'Emergency — go now.' },
  { id: 'burn', title: 'Burns', emoji: '🧯', level: 'urgent',
    keys: ['burn', 'jal gaya', 'jala', 'fire', 'aag', 'hot water', 'acid', 'cracker', 'patakha'],
    steps: ['Cool the burn with gently running cool water for 10–20 minutes.', 'Cover loosely with a clean, damp, non-fluffy cloth.', 'Keep the animal warm elsewhere (burns cause shock).', 'For chemical/acid burns, rinse with lots of water wearing gloves.', 'Take to a vet.'],
    donts: ['Don’t apply ice, butter, oil, toothpaste or ointments.', 'Don’t pop blisters.'],
    vet: 'All burns larger than a coin, on face/paws, or from chemicals.' },
  { id: 'maggot', title: 'Maggot wound', emoji: '🪱', level: 'urgent',
    keys: ['maggot', 'keede', 'kide', 'worms in wound', 'smell', 'badbu', 'rotting', 'infested'],
    steps: ['Keep the animal in shade and away from flies.', 'Gently cover the wound with clean gauze/cloth to stop more flies.', 'If you have it, flush gently with clean saline (salt water).', 'Call a rescuer/vet — maggot wounds need professional cleaning and medicines.', 'Offer water and food — the animal is often weak.'],
    donts: ['Don’t pour kerosene, phenyl, petrol or turpentine — it is very painful and toxic.', 'Don’t pull maggots out with force.'],
    vet: 'Same day — maggots eat healthy tissue quickly.' },
  { id: 'snake', title: 'Snake bite', emoji: '🐍', level: 'critical',
    keys: ['snake', 'saanp', 'saap', 'bite swelling', 'fang', 'naag'],
    steps: ['Keep the animal still and calm — movement spreads venom.', 'Keep the bitten part at or below heart level.', 'Remove collar if the bite is on the face/neck (swelling).', 'Carry it — don’t let it walk — to a vet with anti-venom.', 'Remember the snake’s look if safe (don’t try to catch it).'],
    donts: ['Don’t cut, suck, apply ice or tie a tourniquet.'],
    vet: 'Emergency — go now.' },
  { id: 'eye', title: 'Eye injury / infection', emoji: '👁️', level: 'urgent',
    keys: ['eye', 'aankh', 'discharge', 'swollen eye', 'blind', 'pus'],
    steps: ['Stop the animal from scratching/rubbing the eye.', 'Gently clean discharge with cotton dipped in clean lukewarm water (fresh cotton for each wipe).', 'If something is in the eye, flush with sterile saline.', 'Keep it in a dim, quiet place and see a vet.'],
    donts: ['Don’t use human eye drops.', 'Don’t try to remove objects stuck in the eye.'],
    vet: 'Same day — eye problems can worsen fast.' },
  { id: 'baby', title: 'Abandoned puppies / kittens', emoji: '🍼', level: 'moderate',
    keys: ['puppies', 'puppy', 'kitten', 'baby', 'bachche', 'abandoned', 'newborn', 'box', 'mother', 'maa'],
    steps: ['Watch from a distance for 1–2 hours — the mother may be nearby looking for food.', 'Keep them WARM first: a box with a soft cloth and a warm (not hot) water bottle wrapped in cloth.', 'Keep them together and away from rain, sun and traffic.', 'Young puppies/kittens need puppy/kitten milk replacer in small amounts — ask a vet.', 'Contact a rescuer/shelter for fostering.'],
    donts: ['Don’t give cow/buffalo milk (causes diarrhoea).', 'Don’t feed a cold baby — warm it first.', 'Don’t separate them from the mother if she is around.'],
    vet: 'If they are weak, cold, crying constantly or have diarrhoea.' },
  { id: 'hungry', title: 'Weak / Hungry stray', emoji: '🍚', level: 'moderate',
    keys: ['hungry', 'bhook', 'thin\\b', 'starving', 'not eating', 'khana', 'food', 'skinny'],
    steps: ['Offer clean water first.', 'Give small portions of soft, plain food: rice with curd, boiled egg, plain chicken (for dogs) or plain fish (for cats).', 'Feed small amounts every few hours rather than one big meal.', 'Check for wounds, ticks or skin problems and report if found.'],
    donts: ['Don’t give chocolate, onion, garlic, grapes, spicy or salty food.', 'Don’t give milk to adult cats/dogs.'],
    vet: 'If it refuses food for 2+ days, vomits, or has diarrhoea.' },
  { id: 'bird', title: 'Injured bird', emoji: '🐦', level: 'moderate',
    keys: ['bird', 'pigeon', 'kabootar', 'parrot', 'crow', 'kite', 'cheel', 'wing', 'manjha', 'kite string'],
    steps: ['Gently cover the bird with a light cloth and pick it up with both hands.', 'Put it in a cardboard box with air holes and a soft cloth.', 'Keep the box in a dark, quiet, warm place — darkness calms birds.', 'If tangled in kite string (manjha), cut the string carefully, don’t pull.', 'Contact a bird hospital/rescuer.'],
    donts: ['Don’t force water or food into the beak.', 'Don’t keep checking on it — stress can kill birds.'],
    vet: 'As soon as possible, especially for bleeding or a broken wing.' },
];

const AI = {
  // Find which first-aid topics match free text (English + Hinglish)
  match(text) {
    const t = (text || '').toLowerCase();
    const scored = FIRST_AID.map(f => ({ f, s: f.keys.reduce((a, k) => a + (new RegExp('(^|[^a-z])' + k).test(t) ? (k.length > 4 ? 2 : 1) : 0), 0) }))
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s);
    return scored.map(x => x.f);
  },

  // Emergency categorisation used on every new report
  triage(text, tags = []) {
    const m = this.match(text + ' ' + tags.join(' '));
    const rank = { critical: 3, urgent: 2, moderate: 1 };
    let level = 'moderate';
    m.forEach(f => { if (rank[f.level] > rank[level]) level = f.level; });
    const label = { critical: 'Critical – needs help within minutes', urgent: 'Urgent – needs help within hours', moderate: 'Moderate – needs help today' }[level];
    return { level, label, topics: m.slice(0, 3) };
  },

  summary(c) {
    const tr = this.triage(c.description + ' ' + c.title, c.condition || []);
    const topics = tr.topics.map(t => t.title).join(', ') || 'General care';
    return `${c.animal} • ${tr.label}. Likely needs: ${topics}. Reported ${timeAgo(c.createdAt)} at ${c.address || 'shared GPS location'}.`;
  },

  // Main chat answer → returns HTML
  async answer(text, ctx = {}) {
    const local = this.localAnswer(text);
    const key = Store.db.settings.aiKey;
    if (!key) return local;
    try {
      const ai = await this.gemini(text, ctx);
      return `<div class="ai-card">${mdLite(ai)}</div>` + (this.match(text).length ? `<details class="ai-more"><summary>Show BrunoVerse first-aid card</summary>${local}</details>` : '');
    } catch (e) {
      console.warn(e);
      return local + `<p class="muted small">(Online AI unavailable — showing offline first-aid guide.)</p>`;
    }
  },

  localAnswer(text) {
    const m = this.match(text);
    if (!m.length) {
      return `<div class="ai-card"><p>I’m here to help 💛 Tell me what you see — for example <b>“dog bleeding from leg”</b>, <b>“cat not eating”</b>, <b>“puppy hit by bike”</b>, or tap a quick topic below.</p>
        <p><b>While you wait for a rescuer:</b></p><ol>${['Keep a safe distance and keep the animal calm.', 'Move it away from traffic only if it is safe to do so.', 'Offer clean water if it is conscious and can swallow.', 'Take a clear photo/video and share your GPS location from the Report page.'].map(s => `<li>${s}</li>`).join('')}</ol>
        ${safetyBlock()}</div>`;
    }
    return m.slice(0, 2).map(f => firstAidCard(f)).join('');
  },

  async gemini(text, ctx) {
    const model = Store.db.settings.aiModel || 'gemini-2.0-flash';
    const sys = `You are BrunoVerse AI, a calm, kind animal first-aid assistant for India. The user may write in English, Hindi or Hinglish — reply in the same language style. Give short numbered QUICK STEPS for what to do right now while waiting for a rescuer/vet, then "Don't" points, then human-safety tip, then when to see a vet. Never diagnose or prescribe dosages. Never suggest human medicines. Keep it under 180 words. ${ctx.pet ? 'User pet context: ' + ctx.pet : ''}`;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(Store.db.settings.aiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: 'user', parts: [{ text }] }] }),
    });
    if (!r.ok) throw new Error('AI ' + r.status);
    const j = await r.json();
    return j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || 'No answer';
  },
};

function safetyBlock() {
  return `<div class="ai-safety">${icon('shield', 16)} <div><b>Your safety first</b><ul>${SAFETY.slice(0, 3).map(s => `<li>${s}</li>`).join('')}</ul></div></div>`;
}

function firstAidCard(f, compact = false) {
  const lv = { critical: 'Critical', urgent: 'Urgent', moderate: 'Moderate' }[f.level];
  return `<div class="ai-card">
    <div class="ai-head"><span class="ai-emoji">${f.emoji}</span><b>${f.title}</b><span class="badge lvl-${f.level}">${lv}</span></div>
    <p class="ai-sub">Quick steps while help is on the way:</p>
    <ol class="ai-steps">${f.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    ${compact ? '' : `<div class="ai-dont"><b>❌ Don’t</b><ul>${f.donts.map(s => `<li>${s}</li>`).join('')}</ul></div>`}
    <div class="ai-vet">${icon('hospital', 16)} <span>${f.vet}</span></div>
    ${compact ? '' : safetyBlock()}
  </div>`;
}

function mdLite(s) {
  const esc = s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  return esc.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>').replace(/^\s*\d+[.)]\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`).replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
}
