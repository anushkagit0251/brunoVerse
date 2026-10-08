export const LEARNING_CATEGORIES = [
  { id: 'ALL', label: 'All Knowledge Guides' },
  { id: 'Pet Care', label: 'Pet Care' },
  { id: 'Pet Nutrition', label: 'Pet Nutrition' },
  { id: 'Vaccination', label: 'Vaccination' },
  { id: 'First Aid', label: 'First Aid' },
  { id: 'Animal Rescue', label: 'Animal Rescue' },
  { id: 'Responsible Pet Ownership', label: 'Responsible Pet Ownership' },
  { id: 'Dog Care', label: 'Dog Care' },
  { id: 'Cat Care', label: 'Cat Care' },
  { id: 'Emergency Care', label: 'Emergency Care' },
];

export const LEARNING_TOPICS = [
  // 1. Pet Care
  {
    id: 'pc-hygiene',
    category: 'Pet Care',
    title: 'Essential Daily Routine & Hygiene Practices for Domestic Companions',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    summary: 'Master the fundamental hygiene protocols, ear cleaning routines, and coat inspection habits that prevent chronic infections.',
    paragraphs: [
      'Establishing a disciplined daily hygiene routine is the foundation of preventative healthcare for your domestic animals. Just like humans, pets accumulate environmental contaminants, pollen, and bacteria in their fur, paws, and ear canals. Daily physical inspections allow pet parents to detect abnormalities such as localized inflammation, ticks, mats, or skin lesions before they escalate into painful dermatological infections.',
      'Special attention must be given to interdigital spaces (between the paw pads) and ear flaps. Dogs walking on urban sidewalks frequently pick up chemical residues, lawn fertilizers, and sharp gravel that can cause pododermatitis. Wiping your pet’s paws with a damp microfiber towel or veterinary-approved wipes after every outdoor walk drastically decreases pathogen load and prevents compulsive paw-licking.',
      'Ear hygiene should never involve inserting cotton swabs deep into the horizontal canal. Instead, apply a veterinarian-formulated cleansing solution, gently massage the base of the ear to loosen debris, and allow your pet to shake their head before wiping away expelled material with a sterile gauze pad. Consistent repetition makes grooming a positive bonding ritual rather than a stressful struggle.'
    ],
    keyPoints: [
      'Inspect coat, ears, and paws daily for early detection of parasites or foreign objects.',
      'Clean paws after outdoor walks to prevent chemical burns and allergen ingestion.',
      'Never insert cotton swabs into ear canals; clean only visible folds with gauze.',
      'Maintain nails at a length where they do not click loudly or touch the floor during normal posture.'
    ],
    tips: [
      'Introduce grooming tools during quiet evening hours paired with high-value treats.',
      'Check paw pads for micro-cracks during winter cold and extreme summer pavement heat.',
      'Brush long-coated breeds before bathing, as wet mats become significantly tighter and harder to remove.'
    ],
    warning: 'Persistent head shaking, foul odors from the ear canal, or black coffee-ground discharge are hallmark signs of ear mites or deep bacterial otitis requiring immediate veterinary evaluation.',
    learnMore: [
      'Consult your veterinarian for breed-tailored grooming frequencies.',
      'Learn how to inspect the skin barrier for signs of seasonal atopic dermatitis.',
      'Review safe desensitization techniques for pets with handling anxiety.'
    ]
  },
  {
    id: 'pc-dental',
    category: 'Pet Care',
    title: 'Preventative Dental Hygiene & Periodontal Health in Pets',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80',
    summary: 'Understand how unaddressed plaque progresses to systemic organ damage and how daily brushing safeguards vital health.',
    paragraphs: [
      'Periodontal disease is the single most prevalent medical condition in adult dogs and cats, affecting over eighty percent of pets by the age of three. When oral bacteria combine with saliva and food particles, they form plaque. Without mechanical removal, plaque mineralizes into calculus (tartar) within forty-eight hours, creating a bacterial fortress beneath the gumline.',
      'The consequences of dental neglect extend far beyond bad breath. As gingivitis progresses into deep periodontal disease, the oral mucosal barrier breaks down. Bacteria routinely enter the bloodstream (bacteremia) during chewing, travelling directly to the heart valves, kidneys, and liver, where they cause micro-abscesses and accelerated organ degeneration.',
      'The gold standard of preventative care is daily brushing with enzymatic pet toothpaste. Human toothpastes contain foaming agents (like sodium lauryl sulfate) and artificial sweeteners (notably xylitol/birch bark extract) which are fatally toxic to companion animals. By combining daily mechanical brushing with veterinary-certified dental chews and annual professional cleanings under anesthesia, pet parents can add years of comfortable life to their companions.'
    ],
    keyPoints: [
      'Over 80% of companion animals develop periodontal disease by age three without preventative care.',
      'Oral bacteria enter the bloodstream, causing cumulative damage to kidneys, liver, and heart valves.',
      'Human toothpaste is strictly forbidden due to toxic fluoride and fatal xylitol.',
      'Anesthesia is essential for thorough subgingival cleaning and root pocket evaluation.'
    ],
    tips: [
      'Begin finger-brushing desensitization with poultry or beef-flavored enzymatic toothpaste as a treat.',
      'Focus brushing on the outer surfaces of the upper premolars and molars where salivary ducts deposit calculus.',
      'Look for the Veterinary Oral Health Council (VOHC) seal on dental chews and water additives.'
    ],
    warning: 'Severe halitosis, red bleeding gums, loose teeth, or sudden reluctance to chew dry kibble are urgent symptoms of advanced periodontal bone destruction requiring urgent dental intervention.',
    learnMore: [
      'Ask your clinic for dental radiography options during standard dental scaling.',
      'Explore veterinary oral rinses that inhibit calculus formation between professional cleanings.'
    ]
  },

  // 2. Pet Nutrition
  {
    id: 'pn-macronutrients',
    category: 'Pet Nutrition',
    title: 'Balancing Macronutrients: Protein, Healthy Fats & Micronutrient Requirements',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
    summary: 'Discover how tailored biological nutrition fuels muscular vitality, sustained energy, and healthy metabolic longevity.',
    paragraphs: [
      'Nutritional science is the cornerstone of clinical wellness. Dogs and cats have fundamentally different metabolic blueprints: while dogs are facultative carnivores capable of processing varied carbohydrates, cats are obligate carnivores with rigid evolutionary requirements for high animal-tissue proteins, pre-formed vitamin A, arachidonic acid, and the essential amino acid taurine.',
      'Proteins must supply the complete spectrum of essential amino acids required for cellular repair, antibody synthesis, and muscle maintenance. High biological value sources—such as debone chicken, wild fish, and whole eggs—provide optimal bioavailability. In contrast, dietary fats provide concentrated caloric energy and essential fatty acids (Omega-3 EPA/DHA and Omega-6) critical for modulating systemic inflammation and maintaining healthy cell membranes.',
      'Micronutrient balance is equally delicate. An improper calcium-to-phosphorus ratio in homemade diets can cause catastrophic developmental skeletal disorders in growing puppies. Feeding commercial complete-and-balanced diets formulated to AAFCO or FEDIAF guidelines guarantees that all micro-minerals, trace elements, and fat-soluble vitamins are precisely balanced for your pet’s exact life stage.'
    ],
    keyPoints: [
      'Cats are obligate carnivores and cannot synthesize taurine, necessitating animal-derived diets.',
      'Dietary Omega-3 fatty acids (EPA/DHA) actively reduce systemic joint and cutaneous inflammation.',
      'Calcium to phosphorus ratios must be strictly balanced, especially for large-breed growing puppies.',
      'Life-stage nutrition (puppy, adult, senior) is vital to match evolving caloric and organ workloads.'
    ],
    tips: [
      'Always transition food changes over 7 to 10 days by gradually mixing increasing proportions of new diet.',
      'Use feeding scales rather than measuring cups to prevent accidental overfeeding and obesity.',
      'Provide fresh filtered water in clean ceramic or stainless steel bowls away from litter boxes.'
    ],
    warning: 'Never attempt a vegan or meat-free diet for feline companions. Taurine and arachidonic acid deficiencies cause irreversible dilated cardiomyopathy and blindness in cats.',
    learnMore: [
      'Calculate your pet’s Resting Energy Requirement (RER) based on current body condition score.',
      'Read about specialized renal, gastrointestinal, and hydrolysed diets for sensitive pets.'
    ]
  },
  {
    id: 'pn-toxic-foods',
    category: 'Pet Nutrition',
    title: 'Toxic Foods Alert: Common Kitchen Ingredients Poisonous to Dogs & Cats',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    summary: 'Review high-risk human foods that induce acute kidney failure, hemolytic anemia, and neurological collapse.',
    paragraphs: [
      'Many household foods completely safe for human consumption are potent, life-threatening metabolic poisons for companion animals. The canine and feline digestive systems lack crucial hepatic enzymes needed to metabolize several compounds routinely found in everyday recipes, baked goods, and fruit bowls.',
      'Grapes and raisins can trigger unpredictable, acute renal failure in canines, even in microscopic quantities. The allium family—encompassing onions, garlic, shallots, leeks, and chives—contains thiosulfates that cause oxidative damage to red blood cells, resulting in life-threatening hemolytic anemia and organ hypoxia. Chocolate and coffee contain theobromine and caffeine, which overstimulate the central nervous and cardiovascular systems, precipitating tachyarrhythmias, seizures, and death.',
      'Another insidious hazard is xylitol (birch sugar), an artificial sweetener common in sugar-free gums, baked goods, and peanut butter. In dogs, xylitol induces a massive surge of insulin release, plummeting blood sugar into severe hypoglycemic shock within thirty minutes, frequently followed by acute, irreversible hepatic necrosis.'
    ],
    keyPoints: [
      'Grapes and raisins can cause acute, irreversible kidney failure in dogs.',
      'Onions, garlic, and leeks destroy red blood cells, leading to severe hemolytic anemia.',
      'Xylitol causes catastrophic hypoglycemia and acute liver failure within hours.',
      'Chocolate contains theobromine; darker chocolate carries significantly higher toxicity.'
    ],
    tips: [
      'Always read ingredient labels on peanut butter for xylitol/birch sugar before using for pill administration.',
      'Keep kitchen trash cans securely latched to prevent pets from scavenging toxic food scraps.',
      'Save the animal poison control and nearest 24/7 emergency veterinary hospital phone numbers in your phone.'
    ],
    warning: 'If you suspect your pet consumed chocolate, grapes, onions, or xylitol, do NOT induce vomiting at home without direct veterinary direction. Immediately rush to an emergency veterinary clinic.',
    learnMore: [
      'Explore comprehensive lists of pet-safe treat alternatives like carrots, pumpkin, and green beans.',
      'Understand how activated charcoal and IV fluid diuresis are used during poisoning decontamination.'
    ]
  },

  // 3. Vaccination
  {
    id: 'va-core-schedule',
    category: 'Vaccination',
    title: 'Core vs Non-Core Immunization Schedules from Puppyhood to Senior Age',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80',
    summary: 'Protect your pet with the definitive vaccine timetable against Parvovirus, Distemper, Rabies, and Leptospirosis.',
    paragraphs: [
      'Vaccination remains the single most triumphant breakthrough in companion animal medicine, turning previously lethal viral epidemics into entirely preventable conditions. Immunization stimulates the pet’s adaptive immune system to produce targeted antibodies and memory cells without contracting the full-blown virulent pathology.',
      'Vaccines are categorized by international bodies (like WSAVA) into Core and Non-Core inoculations. Core vaccines are non-negotiable for every single animal regardless of lifestyle. For canines, this includes Canine Parvovirus (CPV), Canine Distemper Virus (CDV), Canine Adenovirus (Infectious Hepatitis), and Rabies. For felines, core protection includes Feline Panleukopenia (FPV), Feline Herpesvirus-1 (FHV-1), Feline Calicivirus (FCV), and Rabies.',
      'Puppies and kittens receive maternal antibodies through early colostrum, which protect them during the first weeks of life. However, these maternal antibodies gradually wane and can neutralize early vaccine doses. Therefore, pediatric vaccine protocols require booster shots every 3 to 4 weeks until sixteen weeks of age to ensure an active immune response takes hold.'
    ],
    keyPoints: [
      'Core vaccines are medically essential for all pets regardless of indoor or outdoor lifestyle.',
      'Puppy and kitten series must continue until at least 16 weeks of age to overcome maternal antibody interference.',
      'Rabies vaccination is legally mandated in most regions due to public health transmission risks.',
      'Non-core vaccines (Leptospirosis, Kennel Cough, Lyme) are determined by geographic and lifestyle risk.'
    ],
    tips: [
      'Maintain an official digital and paper vaccination certificate with batch numbers and expiration dates.',
      'Avoid high-traffic dog parks or public grounds until 10–14 days after the final puppy booster.',
      'Discuss vaccine titre testing (antibody concentration checks) with your vet for senior adult pets.'
    ],
    warning: 'Canine Parvovirus is extremely hardy in soil and surfaces for up to a year. Never allow unvaccinated puppies to walk in public streets or socialize with unverified dogs.',
    learnMore: [
      'Read WSAVA Global Vaccination Guidelines for modern 3-year adult revaccination intervals.',
      'Learn how Leptospirosis is transmitted through stagnant rainwater and rodent urine.'
    ]
  },
  {
    id: 'va-reactions-titre',
    category: 'Vaccination',
    title: 'Recognizing & Managing Post-Vaccine Reactions and Antibody Titre Testing',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&auto=format&fit=crop&q=80',
    summary: 'Learn the difference between normal mild post-vaccine fatigue and severe anaphylactoid emergencies.',
    paragraphs: [
      'Vaccines work by engaging the immune machinery. It is completely normal for a dog or cat to experience mild, temporary lethargy, a low-grade fever, or slight localized soreness at the injection site for 24 to 36 hours post-inoculation. These minor signs indicate that the pet’s immune system is recognizing the antigens and mounting a robust antibody cascade.',
      'However, severe adverse reactions—termed anaphylaxis or type-1 hypersensitivity—require immediate emergency intervention. Symptoms occur within minutes to a few hours of injection and include facial swelling (angioedema), hives, persistent vomiting, diarrhea, pale gums, respiratory distress, and sudden collapse. Veterinary teams treat these crises with fast-acting antihistamines, corticosteroids, and epinephrine.',
      'For pet parents worried about vaccine frequency or pets with prior adverse events, antibody titre testing (such as VacciCheck) offers a scientifically validated solution. A small blood draw measures circulating antibodies against core diseases like Parvovirus and Distemper. If protective titers remain strong, unnecessary revaccination can be deferred safely.'
    ],
    keyPoints: [
      'Mild lethargy and soreness for 24 hours are normal physiological immune responses.',
      'Facial swelling, hives, vomiting, or collapse are signs of acute anaphylaxis requiring immediate emergency care.',
      'Titre testing measures existing antibodies to confirm whether immunity is still active.',
      'A small, painless knot may form under the skin post-injection; it should resolve within 3 to 4 weeks.'
    ],
    tips: [
      'Plan vaccinations on mornings when you will be home to monitor your pet for the next six hours.',
      'If your pet experienced a reaction in the past, request preventative pre-medication with an antihistamine.',
      'Keep newly vaccinated pets quiet and avoid vigorous exercise on inoculation day.'
    ],
    warning: 'If your pet exhibits swollen muzzle, swelling around the eyes, wheezing, or repetitive vomiting after a vaccine, transport them back to the veterinary hospital immediately without delay.',
    learnMore: [
      'Understand how ELISA titre test kits provide quantitative immunity readings in under an hour.',
      'Review feline injection-site sarcoma monitoring rules (the 3-2-1 rule).'
    ]
  },

  // 4. First Aid
  {
    id: 'fa-wound-care',
    category: 'First Aid',
    title: 'Immediate Triage & Hemorrhage Control for Bleeding Wounds',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80',
    summary: 'Master the principles of direct pressure, sterile bandaging, and shock management during animal trauma.',
    paragraphs: [
      'Severe bleeding from bite wounds, glass lacerations, or traffic trauma can quickly induce hypovolemic shock. When an injured animal is bleeding profusely, your first priority is direct, firm, and continuous pressure applied directly over the bleeding site using clean gauze, cotton pads, or a clean cloth. Never repeatedly lift the gauze to check the wound; doing so dislodges forming blood clots and restarts active hemorrhaging.',
      'Injured pets in acute pain will instinctively bite their most trusted human caretakers as a defensive reflex. Before applying wound pressure, safely muzzle the pet using a soft muzzle or a temporary gauze tie, provided the animal is not vomiting or in respiratory distress. Keep the pet warm with a light blanket to prevent hypothermia, which impairs the blood’s natural clotting cascade.',
      'Avoid applying restrictive tourniquets on limbs unless you are dealing with catastrophic arterial spurting and have received hands-on veterinary training. Improper tourniquet application cuts off venous return, causes ischemic nerve death, and can lead to limb amputation. Once direct pressure is applied, transport the animal immediately to the nearest emergency veterinary facility.'
    ],
    keyPoints: [
      'Direct continuous pressure for at least 5–10 minutes is the primary method to stop bleeding.',
      'Do not lift or remove saturated bandages; add additional layers directly on top.',
      'Muzzle an animal in pain for your own safety before administering first aid, unless they are choking or gasping.',
      'Keep the patient warm and quiet during transport to prevent hypovolemic shock collapse.'
    ],
    tips: [
      'Assemble a dedicated pet first aid kit with cohesive flexible bandage (Vetrap), sterile gauze, and saline flush.',
      'Flush contaminated wounds with sterile isotonic saline; avoid pouring hydrogen peroxide into deep wounds as it damages healthy cells.',
      'Phone the emergency hospital while en route so their trauma team can prepare the surgical suite.'
    ],
    warning: 'Never apply tourniquets around the neck or leave tight limb tourniquets on for more than ten minutes. Tourniquets should only be considered for catastrophic limb amputation bleeds.',
    learnMore: [
      'Learn how to assess capillary refill time (CRT) and gum color to check for shock.',
      'Review the proper technique for crafting an emergency gauze muzzle.'
    ]
  },
  {
    id: 'fa-heatstroke',
    category: 'First Aid',
    title: 'Heatstroke Emergency: Rapid Cooling Protocol & Vital Signs Monitoring',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80',
    summary: 'Step-by-step emergency cooling instructions to prevent fatal multi-organ failure and disseminated intravascular coagulation.',
    paragraphs: [
      'Unlike humans who possess sweat glands across their entire body, dogs and cats can only dissipate heat through panting and minimal sweating from paw pads. When ambient humidity is elevated or a pet is trapped in an enclosed space (such as a parked car or unshaded terrace), panting fails to lower body temperature. Body heat rapidly climbs above 40.5°C (105°F), triggering cellular protein denaturation, cerebral edema, and acute multi-organ collapse.',
      'Brachycephalic (flat-faced) breeds like Pugs, French Bulldogs, and Persian cats are exceptionally vulnerable due to elongated soft palates and stenotic nares. Key symptoms include frantic heavy panting, thick ropey drool, dark red or purple tongue, glassy unfocused eyes, muscle tremors, and collapse.',
      'Emergency cooling must begin immediately at the scene before transport. Move the pet into shade or an air-conditioned room. Douse the dog with cool (lukewarm) tap water—focusing on the paws, groin, and neck—and place a fan in front of them to maximize evaporative cooling. Never submerge the animal in ice water or apply ice packs, as this causes peripheral vasoconstriction, trapping core heat inside the vital organs.'
    ],
    keyPoints: [
      'Heatstroke occurs when internal core temperature exceeds 40.5°C (105°F).',
      'Brachycephalic (flat-faced) breeds have narrow airways and are at ultra-high risk.',
      'Cool with lukewarm or cool tap water and airflow; NEVER use ice water or freezing packs.',
      'Stop active cooling once rectal temperature reaches 39.4°C (103°F) to avoid hypothermia overshoot.'
    ],
    tips: [
      'Offer small sips of cool water, but never force-feed water to a panting, disoriented animal.',
      'Never leave pets in parked cars, even with cracked windows—cabin temperatures climb to 48°C in minutes.',
      'Walk dogs only before sunrise or after dusk during summer months, always testing pavement with the back of your hand.'
    ],
    warning: 'Even if the pet appears to recover after initial cooling, internal damage to kidneys, gut lining, and clotting factors can be fatal 48 hours later. Full veterinary hospital monitoring is mandatory.',
    learnMore: [
      'Learn how to monitor hydration and core temperature with a lubricated digital rectal thermometer.',
      'Understand systemic complications like Disseminated Intravascular Coagulation (DIC).'
    ]
  },

  // 5. Animal Rescue
  {
    id: 'ar-safe-capture',
    category: 'Animal Rescue',
    title: 'Safe Capture & De-escalation Techniques for Injured Stray Animals',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80',
    summary: 'Protect both rescuer and animal using body language de-escalation, slip leashes, blankets, and safe containment.',
    paragraphs: [
      'Rescuing an injured, distressed street animal requires patience, empathy, and strict tactical safety precautions. An animal in pain operates in survival fight-or-flight mode. Even an ordinarily gentle dog or cat can bite with full force when cornered or manipulated near an agonizing fracture. Successful field rescue begins with controlling the immediate environment: divert traffic, minimize noise, and keep onlookers at a calm distance.',
      'Approach the animal sideways without making direct eye contact, which is perceived as an aggressive predatory threat. Crouch down low to reduce your silhouette and speak in low, soothing tones. Tossing small pieces of highly aromatic food (such as boiled chicken or liver treats) slightly to the side of the animal allows you to assess their alertness and appetite while building preliminary trust.',
      'For containment, a soft, sturdy blanket or large towel is an invaluable tool. Gently draping a blanket over a traumatized cat or small dog instantly covers their visual field, significantly reducing panic, while allowing safe bundle-handling without direct claw or tooth contact. For medium to large dogs, a slip-lead looped around the neck provides immediate, safe directional control without the need to fumble with collars.'
    ],
    keyPoints: [
      'Never make direct eye contact or tower directly over a frightened injured animal.',
      'Use the blanket taco-wrap technique to safely secure cats and small dogs.',
      'Always secure the scene from vehicular traffic before attempting rescue extraction.',
      'Use a sturdy crate or secure crate base for immediate vehicle transport.'
    ],
    tips: [
      'Keep a rescue kit in your vehicle trunk: heavy towels, slip leashes, bite-resistant gloves, and collapsible crates.',
      'If an animal is aggressive or trapped in a dangerous location, call professional NGO rescue handlers.',
      'Take clear, geo-tagged photos and post on the BrunoVerse Rescue Hub to alert nearby volunteers.'
    ],
    warning: 'If a stray animal exhibits erratic aggression, unprovoked biting, staggering paralysis, or heavy frothing at the mouth, suspect rabies. Do NOT attempt contact; notify municipal authorities immediately.',
    learnMore: [
      'Explore humane trap-neuter-vaccinate-return (TNVR) protocols for community animals.',
      'Join the BrunoVerse volunteer network for rescue dispatch notifications.'
    ]
  },
  {
    id: 'ar-transport-trauma',
    category: 'Animal Rescue',
    title: 'Field Stabilization & Safe Transport Protocol for Hit-and-Run Victims',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80',
    summary: 'Guidelines for spinal immobilization, improvised stretchers, and avoiding secondary injury during rescue transit.',
    paragraphs: [
      'Vehicular hit-and-run accidents are the leading cause of catastrophic trauma among community animals. When encountering a roadside victim, responders must assume spinal fractures, pelvic breaks, diaphragmatic hernia, and internal hemorrhage until proven otherwise by veterinary diagnostics. Careless lifting can sever a compromised spinal cord and cause permanent paralysis.',
      'To move a recumbent animal, construct an improvised stretcher using a rigid board, firm car boot liner, or taut blanket held by multiple rescuers at all four corners. Gently slide the animal onto the stretcher using a gentle rolling motion rather than pulling individual limbs. Keep the head, neck, and spine aligned in a neutral straight posture at all times.',
      'During vehicle transport, secure the animal so they cannot slide or fall during sudden braking. Keep the car quiet, dimly lit, and warm. Position the animal on their side with the neck extended to ensure clear airways, and elevate the head slightly if there is suspected chest trauma. Call ahead to the receiving veterinary hospital to alert their trauma team.'
    ],
    keyPoints: [
      'Always assume spinal or pelvic fractures in road accident victims.',
      'Never pick up an injured animal by their legs; slide them onto a flat, rigid board or taut blanket.',
      'Maintain the neck and spine in neutral alignment throughout the transport.',
      'Phone the receiving hospital with an ETA and description of injuries.'
    ],
    tips: [
      'Place puppy pads or towels under the animal to absorb blood, urine, or saliva comfortably.',
      'Drive smoothly without rapid acceleration or harsh cornering to minimize pain spikes.',
      'Log the exact GPS coordinates on BrunoVerse so veterinary records can track origin history.'
    ],
    warning: 'Animals with punctured chests or diaphragmatic hernias struggle to breathe. Never compress the chest or tie bandages around the ribs during transit.',
    learnMore: [
      'Learn how veterinarians triage trauma victims using the ABC (Airway, Breathing, Circulation) framework.',
      'Understand how fluid resuscitation stabilizes blood pressure before orthopedic surgery.'
    ]
  },

  // 6. Responsible Pet Ownership
  {
    id: 'rpo-microchipping-laws',
    category: 'Responsible Pet Ownership',
    title: 'Microchipping, Legal Licensing & Community Etiquette',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    summary: 'Understand the legal, ethical, and community responsibilities that ensure lifetime pet safety and neighborhood harmony.',
    paragraphs: [
      'Bringing a companion animal into your home is an ethical commitment that spans ten to twenty years. Responsible guardianship transcends basic feeding; it encompasses legal identification, veterinary wellness, neighborhood respect, and lifelong behavioral stewardship. Collars and tags can easily slip off, fade, or break during an escape; a microchip is the only permanent, tamper-proof proof of identity.',
      'A microchip is a passive radio-frequency transponder approximately the size of a grain of rice, implanted beneath the skin between the shoulder blades with a sterile needle. It requires no battery and lasts for the animal’s lifetime. When an animal shelter or veterinary clinic scans a lost pet, the scanner reads a unique 15-digit ISO number that matches your contact details in registered pet databases.',
      'Equally important is community etiquette. Always pick up your dog’s waste in public spaces to prevent the spread of parasitic worms (such as Giardia, Hookworms, and Parvovirus) to other animals and children. Respect leash laws in public parks, and socialize your pet positively so they remain confident, calm, and friendly toward neighbors and other pets.'
    ],
    keyPoints: [
      'Microchips provide permanent, unforgeable identification linking pets directly to their guardians.',
      'Always register your microchip number and keep phone numbers updated in the official database.',
      'Pick up pet waste to prevent environmental contamination and parasitic disease transmission.',
      'Keep dogs on a secure leash in public areas unless inside certified fenced dog parks.'
    ],
    tips: [
      'Have your vet scan your pet’s microchip during every annual wellness checkup to verify readability.',
      'Combine microchipping with an external collar tag displaying your active phone number.',
      'Keep digital copies of municipal pet licenses and vaccination records on your phone.'
    ],
    warning: 'A microchip is useless if you fail to register your current phone number and address in the registry database. Update your details whenever you move or change numbers.',
    learnMore: [
      'Learn how municipal pet registration works in your city and avoid administrative fines.',
      'Read about responsible community feeding guidelines for neighborhood community dogs.'
    ]
  },
  {
    id: 'rpo-financial-planning',
    category: 'Responsible Pet Ownership',
    title: 'The Lifetime Commitment: Financial Budgeting & Healthcare Planning',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
    summary: 'Plan for routine wellness, emergency funds, and senior pet geriatric care without financial distress.',
    paragraphs: [
      'Surrendering an animal due to unexpected medical costs is a tragedy that proper financial planning can prevent. While adopting a pet may carry minimal initial adoption fees, the real costs of pet guardianship unfold over their entire lifespan. Routine annual expenses include high-quality food, annual vaccinations, heartworm and parasite preventatives, professional dental cleanings, and grooming.',
      'However, medical emergencies—such as cruciate ligament tears, foreign body surgeries, or chronic kidney disease treatments—can cost substantial sums. Creating a dedicated emergency veterinary savings fund or investing in pet medical insurance early in the animal’s life provides an indispensable financial safety net.',
      'As pets transition into their senior years (typically age seven and older), their healthcare needs shift toward geriatric medicine. Bi-annual blood panels, urinalysis, thyroid monitoring, and osteoarthritis management become necessary to maintain pain-free mobility and comfort. Budgeting for these predictable life stages ensures your companion enjoys dignified senior years.'
    ],
    keyPoints: [
      'Calculate the 10-15 year projected lifetime cost before bringing an animal home.',
      'Maintain a dedicated emergency veterinary buffer fund for unexpected trauma or illness.',
      'Pet insurance is most cost-effective when enrolled during puppyhood before pre-existing conditions arise.',
      'Senior pets require bi-annual veterinary wellness screens to catch renal or cardiac decline early.'
    ],
    tips: [
      'Automate a small monthly transfer into a dedicated pet health savings account.',
      'Compare pet insurance policies specifically for hereditary and chronic disease coverage limits.',
      'Invest in preventative wellness—it is exponentially cheaper than emergency treatments.'
    ],
    warning: 'Never skip monthly heartworm or tick preventatives to save money. Treating tick fever, Babesiosis, or Heartworm disease is vastly more expensive and carries high mortality.',
    learnMore: [
      'Use the BrunoVerse Pet Cost Calculator to project annual wellness budgets.',
      'Understand senior pet pain management options, including multimodal arthritis therapy.'
    ]
  },

  // 7. Dog Care
  {
    id: 'dc-behavior-enrichment',
    category: 'Dog Care',
    title: 'Canine Behavioral Enrichment, Separation Anxiety & Mental Stimulation',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    summary: 'Solve destructive chewing, compulsive barking, and separation distress through structured mental workouts.',
    paragraphs: [
      'A tired dog is a good dog—but physical exercise alone is rarely enough. Many active dogs taken on five-kilometer runs still exhibit frantic restlessness, destructive chewing, and obsessive barking inside the house. The missing component is mental enrichment. Canines possess over three hundred million olfactory receptors; for a dog, sniffing is cognitively exhausting and emotionally soothing.',
      'Sniffaris (decompression walks where the dog leads and sniffs freely on a long leash), puzzle feeders, snuffle mats, and lick mats trigger the release of endorphins and dopamine in the canine brain. Licking and chewing actively stimulate the vagus nerve, lowering heart rate and down-regulating anxiety levels.',
      'Separation anxiety is another common challenge where dogs panic when left alone. Addressing this requires gradual systematic desensitization: teaching the dog that departure cues (such as picking up keys, putting on shoes) do not predict permanent abandonment, and practicing micro-absences while rewarding calm, independent behavior in a designated safe resting zone.'
    ],
    keyPoints: [
      'Sniffing and mental puzzles exhaust a dog’s energy faster than repetitive physical running.',
      'Licking and chewing stimulate the vagus nerve, reducing stress hormones and promoting relaxation.',
      'Punishing separation anxiety exacerbates fear; systematic desensitization is the scientifically proven solution.',
      'Incorporate food-dispensing toys instead of feeding standard meals out of simple bowls.'
    ],
    tips: [
      'Freeze wet food, pumpkin puree, and plain Greek yogurt inside Kong toys for 45 minutes of calm focus.',
      'Ditch standard bowls: scatter your dog’s kibble on the lawn or roll it in a large towel for a brain workout.',
      'Desensitize departure cues by picking up car keys and sitting back down on the sofa without leaving.'
    ],
    warning: 'Never use shock collars or punitive dominance methods for separation anxiety. Pain and intimidation amplify anxiety, often escalating fear into aggressive defense.',
    learnMore: [
      'Read modern positive-reinforcement behavior literature by certified applied animal behaviorists.',
      'Understand crate training as an open sanctuary rather than a confinement punishment.'
    ]
  },
  {
    id: 'dc-grooming-parasites',
    category: 'Dog Care',
    title: 'Grooming, Coat Maintenance & Parasite Prevention (Ticks & Fleas)',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80',
    summary: 'Shield your canine from debilitating tick-borne blood parasites like Ehrlichia and Babesia with rigorous grooming protocols.',
    paragraphs: [
      'Coat care is an indispensable facet of health monitoring. A dog’s coat acts as a thermal insulator against both winter chills and summer solar radiation. Shaving double-coated breeds (such as Golden Retrievers, German Shepherds, and Huskies) destroys their undercoat architecture, prevents natural cooling, and exposes sensitive skin to sunburn and squamous cell carcinoma.',
      'External parasites—principally fleas and Rhipicephalus sanguineus (brown dog ticks)—are vectors for debilitating systemic blood diseases, including Canine Ehrlichiosis, Babesiosis, and Anaplasmosis. These pathogens destroy platelets and red blood cells, causing acute internal hemorrhage, nosebleeds, and fatal multi-organ failure.',
      'Effective prevention requires modern veterinary-prescribed isoxazoline oral chews or topical spot-on treatments. Over-the-counter flea collars and cheap grocery store shampoos are notoriously ineffective against resistant tick strains. Pair pharmaceutical prevention with regular physical inspections around the ear flaps, armpits, groin, and between toe webs after every walk.'
    ],
    keyPoints: [
      'Never shave double-coated breeds; their multi-layer fur regulates both heat and cold.',
      'Ticks transmit deadly blood parasites like Ehrlichia and Babesia that cause fatal internal bleeding.',
      'Modern veterinary isoxazoline oral preventatives offer month-long protection with high safety margins.',
      'Grooming frequency depends on coat type, with daily de-shedding recommended for shedding breeds.'
    ],
    tips: [
      'Use a tick removal tool to grasp the tick as close to the skin as possible and pull straight out without twisting.',
      'Never burn ticks or smother them with petroleum jelly, which induces them to regurgitate pathogens into the dog.',
      'Wash dog bedding in hot water weekly to eradicate flea eggs and larvae.'
    ],
    warning: 'Sudden lethargy, pale gums, tea-colored urine, or unexplained petechiae (small red bruises on the gums or belly) are emergency symptoms of tick fever requiring immediate blood test analysis.',
    learnMore: [
      'Ask your veterinarian about comprehensive 4Dx blood testing to screen for tick-borne diseases.',
      'Learn the difference between undercoat rakes, slicker brushes, and pin combs.'
    ]
  },

  // 8. Cat Care
  {
    id: 'cc-environmental-needs',
    category: 'Cat Care',
    title: 'Feline Environmental Needs: Litter Box Dynamics & Territory Enrichment',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
    summary: 'Prevent inappropriate elimination and stress cystitis by mastering feline territorial instincts and the N+1 rule.',
    paragraphs: [
      'Domestic cats retain the instinctual wiring of their solitary, territorial wild ancestors. In a home environment, a cat’s sense of security is deeply tied to scent marking and vertical territory control. When an indoor cat feels their territory is restricted or contested, the chronic stress frequently manifests as Feline Idiopathic Cystitis (FIC) or inappropriate urination outside the litter box.',
      'The golden rule of litter box management is the N+1 formula: provide one litter box per cat in the household, plus one additional box in a completely separate room. Cats are privacy-seeking yet vigilant; avoid placing litter trays in noisy laundry rooms near vibrating washing machines or cramped dead-ends where another household pet can ambush them.',
      'Vertical space is equally essential. Cat trees, floating wall perches, and accessible bookshelf paths allow felines to survey their kingdom from above, reducing anxiety and providing safe escape routes during multi-pet conflicts. Provide both vertical and horizontal scratching surfaces made of corrugated cardboard and sisal rope to satisfy natural claw-shedding and scent-marking impulses.'
    ],
    keyPoints: [
      'Follow the N+1 litter box rule: number of cats plus one, placed in distinct locations.',
      'Clean litter boxes daily and avoid strongly scented clumping litters that irritate sensitive feline airways.',
      'Vertical territory (cat trees, wall shelves) is critical for reducing territorial anxiety.',
      'Inappropriate urination is almost always a medical or environmental cry for help, never malice.'
    ],
    tips: [
      'Use large, uncovered litter storage boxes rather than cramped commercial hooded pans.',
      'Position scratchers near entryways and sleeping zones where cats naturally wake and stretch.',
      'Incorporate 10-minute daily interactive wand toy play sessions simulating the hunt-catch-kill-eat cycle.'
    ],
    warning: 'A male cat straining repeatedly in the litter box without producing urine is in immediate danger of a fatal urethral obstruction. This is a life-threatening medical emergency requiring immediate hospital admission.',
    learnMore: [
      'Read the AAFP Feline Environmental Needs Guidelines on the five vital pillars of feline welfare.',
      'Learn how synthetic feline facial pheromone diffusers (Feliway) mitigate environmental stress.'
    ]
  },
  {
    id: 'cc-subtle-illness',
    category: 'Cat Care',
    title: 'Recognizing Silent Feline Distress & Chronic Kidney Disease Signs',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop&q=80',
    summary: 'Detect early subtle symptoms of renal failure, hyperthyroidism, and feline arthritis before crisis stage.',
    paragraphs: [
      'Cats are evolutionarily programmed to mask illness and pain. In the wild, an outwardly weak or injured cat is targeted by predators and expelled by rivals. Consequently, domestic cats do not whimper or limp visibly until disease processes have reached advanced stages. Attentive pet parents must look for microscopic shifts in routine, posture, and appetite.',
      'Chronic Kidney Disease (CKD) is among the most common causes of mortality in senior felines. The earliest warning signs are subtle increases in water consumption (polydipsia) and larger, more frequent urine clumps in the litter box (polyuria). Many owners mistakenly assume their cat is healthy because they are drinking more water, when in fact the kidneys have lost the ability to concentrate urine.',
      'Other subtle red flags include unkempt fur along the lower spine (indicating spinal arthritis preventing grooming), stepping down from furniture rather than jumping, retreating under beds, or unexplained weight loss despite an apparent healthy appetite. Routine annual blood chemistry and blood pressure screens in cats aged seven and older detect renal and metabolic decline years before clinical decompensation.'
    ],
    keyPoints: [
      'Cats instinctively mask illness; subtle behavioral shifts are the earliest medical indicators.',
      'Increased thirst and larger urine clumps are classic early warnings of Chronic Kidney Disease (CKD).',
      'Neglecting coat grooming often indicates spinal or joint arthritis pain rather than laziness.',
      'Senior cats (7+ years) require annual or bi-annual renal blood panels (SDMA and Creatinine).'
    ],
    tips: [
      'Weigh your cat monthly on an accurate baby scale; gradual weight loss is the earliest indicator of chronic illness.',
      'Switch cats to wet, moisture-rich canned food early in life to promote lifelong renal hydration.',
      'Observe litter box habits daily for clump size and frequency changes.'
    ],
    warning: 'A cat that has not eaten for 48 hours is at high risk of developing Feline Hepatic Lipidosis (fatty liver disease), a potentially fatal liver failure condition. Never ignore feline anorexia.',
    learnMore: [
      'Understand how the SDMA renal biomarker detects kidney disease at 25–40% loss of function.',
      'Review dietary management for cats with Chronic Kidney Disease and therapeutic renal diets.'
    ]
  },

  // 9. Emergency Care
  {
    id: 'ec-cpr-airway',
    category: 'Emergency Care',
    title: 'Canine & Feline CPR: Compression Rates, Rescue Breathing & Airway Clearing',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80',
    summary: 'The RECOVER initiative veterinary protocol for cardiopulmonary resuscitation and clearing obstructed airways.',
    paragraphs: [
      'When an animal suffers cardiopulmonary arrest (CPA), cerebral tissue begins irreversible hypoxic death within four minutes. Immediate, high-quality cardiopulmonary resuscitation (CPR) maintains coronary and cerebral perfusion until emergency veterinary intervention can restore spontaneous circulation (ROSC).',
      'The standardized protocol established by the global RECOVER initiative dictates high-quality chest compressions at a rate of 100 to 120 compressions per minute, compressing 1/3 to 1/2 the width of the chest, and allowing complete chest recoil between each compression. For medium, large, and barrel-chested dogs, perform compressions over the widest part of the ribcage in lateral recumbency. For small dogs and cats, perform one-handed cardiac compressions directly over the heart.',
      'If you have a second rescuer or are trained in rescue breathing, provide thirty chest compressions followed by two breaths (30:2 ratio). To deliver rescue breaths, close the animal’s muzzle securely with your hands, create a tight seal over their nostrils with your mouth, and blow until you see the chest rise gently. If an airway is obstructed by a foreign object (e.g. ball, bone), perform an adapted Heimlich maneuver by applying firm upward thrusts behind the last rib while the animal is on their side.'
    ],
    keyPoints: [
      'Perform chest compressions at 100–120 BPM (to the rhythm of "Stayin\' Alive").',
      'Compress 1/3 to 1/2 the chest depth and allow full elastic recoil between strokes.',
      'Deliver rescue breaths through the nostrils while holding the muzzle tightly shut.',
      'Cycle CPR in 2-minute uninterrupted rounds to prevent rescuer fatigue and loss of compression depth.'
    ],
    tips: [
      'Check for a femoral pulse on the inner thigh and observe chest movement for 10 seconds before initiating CPR.',
      'If single-handed, prioritize continuous chest compressions over breaths until help arrives.',
      'Keep your elbows locked and hinge from your waist to maintain adequate compression force.'
    ],
    warning: 'Never perform chest compressions on a conscious animal with an active heartbeat. CPR is strictly reserved for patients with confirmed loss of pulse and unresponsiveness.',
    learnMore: [
      'Explore official RECOVER Initiative certified pet CPR and basic life support courses.',
      'Learn how veterinary trauma teams administer emergency epinephrine, atropine, and defibrillation.'
    ]
  },
  {
    id: 'ec-bloat-gdv',
    category: 'Emergency Care',
    title: 'Bloat & Gastric Dilatation-Volvulus (GDV): Minutes-Matter Emergency Intervention',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80',
    summary: 'Recognize the sudden, fatal stomach twist affecting deep-chested breeds and the critical surgical window.',
    paragraphs: [
      'Gastric Dilatation-Volvulus (GDV), commonly termed "Bloat," is one of the most terrifying, rapidly fatal surgical emergencies in veterinary medicine. It occurs when the stomach fills rapidly with gas (dilatation) and then twists on its mesenteric axis (volvulus). Once rotated, both the entry (esophagus) and exit (duodenum) are blocked, trapping expanding gas and fermentation products.',
      'As the stomach expands like an overinflated balloon, it compresses the caudal vena cava, cutting off venous blood return to the heart. Blood pressure plummets into catastrophic obstructive shock. Simultaneously, the spleen twists alongside the stomach, and gastric tissue begins to necrose from lack of arterial perfusion, releasing massive toxins into the bloodstream.',
      'Deep-chested breeds such as Great Danes, Dobermans, German Shepherds, Boxers, and Standard Poodles carry the highest genetic predisposition. The telltale clinical triad is: non-productive retching (trying desperately to vomit with only white foam produced), extreme restlessness/pacing, and a visibly distended, drum-like abdomen that sounds hollow when tapped. A dog with GDV will die within hours without emergency surgical decompression.'
    ],
    keyPoints: [
      'GDV involves the stomach twisting on itself, trapping gas and cutting off major blood vessels.',
      'Non-productive dry retching is the single most critical warning sign of Bloat.',
      'Deep-chested large dog breeds carry extraordinarily high statistical risk.',
      'Emergency surgery (gastropexy and decompression) is the ONLY cure; every minute counts.'
    ],
    tips: [
      'Avoid vigorous running or heavy exercise for one hour before and two hours after large meals.',
      'Feed two or three smaller meals per day instead of a single massive daily meal.',
      'Consider preventative prophylactic gastropexy surgery during spay/neuter for high-risk deep-chested breeds.'
    ],
    warning: 'If your large-breed dog is pacing frantically, drooling, and attempting to vomit without producing anything, DO NOT WAIT. Transport immediately to an emergency hospital with an operating theater.',
    learnMore: [
      'Learn how prophylactic gastropexy permanently tacks the stomach to the abdominal wall to prevent twisting.',
      'Understand how emergency trocharization relieves gastric pressure during pre-operative stabilization.'
    ]
  }
];
