package com.brunoverse.config;

import com.brunoverse.entity.*;
import com.brunoverse.enums.AnimalType;
import com.brunoverse.enums.RescueStatus;
import com.brunoverse.enums.UrgencyLevel;
import com.brunoverse.enums.UserRole;
import com.brunoverse.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AnimalRepository animalRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final HelpProviderRepository helpProviderRepository;
    private final CommunityPostRepository communityPostRepository;
    private final RescueActivityRepository rescueActivityRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AnimalRepository animalRepository,
                           MedicalRecordRepository medicalRecordRepository,
                           RescueRequestRepository rescueRequestRepository,
                           HelpProviderRepository helpProviderRepository,
                           CommunityPostRepository communityPostRepository,
                           RescueActivityRepository rescueActivityRepository,
                           MessageRepository messageRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.animalRepository = animalRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.rescueRequestRepository = rescueRequestRepository;
        this.helpProviderRepository = helpProviderRepository;
        this.communityPostRepository = communityPostRepository;
        this.rescueActivityRepository = rescueActivityRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        // 1. Seed Users
        User petOwner = new User();
        petOwner.setName("Anushka Gupta");
        petOwner.setEmail("anushka@example.com");
        petOwner.setPhone("9876543210");
        petOwner.setPassword(passwordEncoder.encode("123456"));
        petOwner.setRole(UserRole.PET_OWNER);
        petOwner = userRepository.save(petOwner);

        User rescuer = new User();
        rescuer.setName("Rohit Sharma");
        rescuer.setEmail("rohit@example.com");
        rescuer.setPhone("9812345678");
        rescuer.setPassword(passwordEncoder.encode("123456"));
        rescuer.setRole(UserRole.RESCUER);
        rescuer = userRepository.save(rescuer);

        User vet = new User();
        vet.setName("Dr. Mehta");
        vet.setEmail("dr.mehta@example.com");
        vet.setPhone("9898912345");
        vet.setPassword(passwordEncoder.encode("123456"));
        vet.setRole(UserRole.VETERINARIAN);
        vet = userRepository.save(vet);

        User ngo = new User();
        ngo.setName("Paw Care Foundation");
        ngo.setEmail("pawcare@example.com");
        ngo.setPhone("9777754321");
        ngo.setPassword(passwordEncoder.encode("123456"));
        ngo.setRole(UserRole.NGO);
        ngo = userRepository.save(ngo);

        User volunteer = new User();
        volunteer.setName("Rohan Verma");
        volunteer.setEmail("rohan@example.com");
        volunteer.setPhone("9666688888");
        volunteer.setPassword(passwordEncoder.encode("123456"));
        volunteer.setRole(UserRole.VOLUNTEER);
        volunteer = userRepository.save(volunteer);

        // 2. Seed Animals for Anushka
        Animal bruno = new Animal();
        bruno.setName("Bruno");
        bruno.setType(AnimalType.DOG);
        bruno.setBreed("Golden Retriever");
        bruno.setAge(3);
        bruno.setGender("Male");
        bruno.setPhotoUrl("https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80");
        bruno.setOwner(petOwner);
        bruno = animalRepository.save(bruno);

        Animal misty = new Animal();
        misty.setName("Misty");
        misty.setType(AnimalType.CAT);
        misty.setBreed("Persian Mix");
        misty.setAge(2);
        misty.setGender("Female");
        misty.setPhotoUrl("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80");
        misty.setOwner(petOwner);
        misty = animalRepository.save(misty);

        // 3. Seed Medical Records / Reminders
        MedicalRecord rec1 = new MedicalRecord();
        rec1.setTitle("Bruno — Rabies Vaccine");
        rec1.setDescription("Annual Rabies booster due in 12 days");
        rec1.setDoctorName("Dr. Sharma");
        rec1.setRecordDate(LocalDate.now().plusDays(12));
        rec1.setAnimal(bruno);
        medicalRecordRepository.save(rec1);

        MedicalRecord rec2 = new MedicalRecord();
        rec2.setTitle("Misty — Deworming");
        rec2.setDescription("Quarterly deworming dose due in 1 month");
        rec2.setDoctorName("Dr. Mehta");
        rec2.setRecordDate(LocalDate.now().plusMonths(1));
        rec2.setAnimal(misty);
        medicalRecordRepository.save(rec2);

        MedicalRecord rec3 = new MedicalRecord();
        rec3.setTitle("Bruno — Vet Checkup");
        rec3.setDescription("Routine wellness exam and bloodwork due in 2 months");
        rec3.setDoctorName("Dr. Sharma");
        rec3.setRecordDate(LocalDate.now().plusMonths(2));
        rec3.setAnimal(bruno);
        medicalRecordRepository.save(rec3);

        // 4. Seed Rescue Requests
        createRescue("Injured Dog", "Dog with hurt paw near market, needs urgent first aid", "Sector 15, Noida • 1.2 km",
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80",
                UrgencyLevel.CRITICAL, RescueStatus.PENDING, petOwner, null);

        createRescue("Stray Cat (sick)", "Kitten suffering from eye discharge and dehydration", "Sector 22, Noida • 3.4 km",
                "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80",
                UrgencyLevel.HIGH, RescueStatus.PENDING, volunteer, null);

        createRescue("Cow (injured)", "Cow unable to stand on road divider, needs large animal transporter", "Phase 2, Noida • 5.1 km",
                "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80",
                UrgencyLevel.HIGH, RescueStatus.PENDING, petOwner, null);

        createRescue("Puppies (abandoned)", "4 indie puppies left in cardboard carton near park gate", "Sector 12, Noida • 6.8 km",
                "https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=400&q=80",
                UrgencyLevel.MEDIUM, RescueStatus.PENDING, volunteer, null);

        createRescue("Stray Puppy (injured leg)", "Puppy limping on road side", "Sector 18, Noida • 2.0 km",
                "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80",
                UrgencyLevel.MEDIUM, RescueStatus.PENDING, petOwner, null);

        // 2 Active Rescues (assigned to Rohit)
        createRescue("Trapped Stray Dog", "Dog got stuck in drainage ditch, rescue in progress", "Sector 45, Noida",
                "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80",
                UrgencyLevel.HIGH, RescueStatus.IN_PROGRESS, volunteer, rescuer);

        createRescue("Dehydrated Bird", "Pigeon with wounded wing receiving oral hydration", "Sector 62, Noida",
                "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=400&q=80",
                UrgencyLevel.MEDIUM, RescueStatus.ACCEPTED, petOwner, rescuer);

        // 12 Completed Rescues
        for (int i = 1; i <= 12; i++) {
            createRescue("Resolved Rescue Case #" + i, "Successfully treated, vaccinated and released/rehomed",
                    "Sector " + (10 + i) + ", Noida",
                    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80",
                    UrgencyLevel.LOW, RescueStatus.COMPLETED, volunteer, rescuer);
        }

        // 5. Seed Real Help Providers (Vets, NGOs, Shelters)
        createProvider("Max Vets 24/7 Animal Hospital", "Veterinarian", "1.2 km", "R-55, Greater Kailash 1, New Delhi", "+911141654165", "Call",
                4.8, "https://maxvets.com", 28.5494, 77.2435, "https://www.google.com/maps/dir/?api=1&destination=Max+Vets+Hospital+Greater+Kailash");
        createProvider("DCC Animal Hospital", "Veterinarian", "2.8 km", "Jagdamba Farm, DLF Phase 5, Gurugram, Haryana", "+919311560101", "Call",
                4.7, "https://dccanimalhospital.com", 28.4595, 77.0266, "https://www.google.com/maps/dir/?api=1&destination=DCC+Animal+Hospital+Gurugram");
        createProvider("Friendicoes SECA Veterinary Clinic", "Veterinarian", "3.5 km", "271 Flyover Market, Defence Colony, New Delhi", "+911124320707", "Call",
                4.6, "https://friendicoes.org", 28.5727, 77.2345, "https://www.google.com/maps/dir/?api=1&destination=Friendicoes+SECA+New+Delhi");
        createProvider("Cessna Lifeline Veterinary Hospital", "Veterinarian", "4.1 km", "Domlur Layout, Bengaluru, Karnataka", "+918041105000", "Call",
                4.7, "https://cessnalifeline.com", 12.9610, 77.6387, "https://www.google.com/maps/dir/?api=1&destination=Cessna+Lifeline+Veterinary+Hospital");
        createProvider("Crown Vet 24/7 Pet Hospital", "Veterinarian", "5.2 km", "Arch 28, Below Mahalaxmi Bridge, Mumbai", "+912224902000", "Call",
                4.8, "https://crown.vet", 19.0144, 72.8183, "https://www.google.com/maps/dir/?api=1&destination=Crown+Vet+Mumbai");

        // Seed Real NGOs & Shelters
        createProvider("Friendicoes SECA (Animal Welfare NGO)", "NGO", "3.5 km", "Defence Colony Flyover Market, New Delhi", "+911124320707", "Call",
                4.8, "https://friendicoes.org", 28.5727, 77.2345, "https://www.google.com/maps/dir/?api=1&destination=Friendicoes+SECA+New+Delhi");
        createProvider("People For Animals (PFA Central)", "NGO", "4.2 km", "14 Ashoka Road, Jantar Mantar, New Delhi", "+911123357088", "Call",
                4.7, "https://peopleforanimalsindia.org", 28.6219, 77.2144, "https://www.google.com/maps/dir/?api=1&destination=People+For+Animals+New+Delhi");
        createProvider("Wildlife SOS Animal Rescue NGO", "NGO", "4.8 km", "D-210 Defence Colony, New Delhi", "+919871963535", "Call",
                4.9, "https://wildlifesos.org", 28.5710, 77.2380, "https://www.google.com/maps/dir/?api=1&destination=Wildlife+SOS+New+Delhi");
        createProvider("The Voice of Stray Dogs (VOSD)", "NGO", "5.5 km", "VOSD Sanctuary, Bengaluru, Karnataka", "+918040992200", "Call",
                4.9, "https://vosd.in", 12.9716, 77.5946, "https://www.google.com/maps/dir/?api=1&destination=Voice+of+Stray+Dogs+Bengaluru");
        createProvider("Animal Aid Unlimited Rescue & Shelter", "Shelter", "7.0 km", "Badi Village, Udaipur, Rajasthan", "+919950531639", "Call",
                4.9, "https://animalaidunlimited.org", 24.5854, 73.7125, "https://www.google.com/maps/dir/?api=1&destination=Animal+Aid+Unlimited+Udaipur");

        // 6. Seed Community Posts
        createPost("Found a stray puppy near Sector 12, Noida", "Rescue Needed",
                "Puppy spotted alone near gate 3. Very friendly and hungry. Please contact if anyone can foster or adopt.",
                "https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=600&q=80",
                null, "Karan Gupta", 1L, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", 12, 3, "2h ago");

        createPost("Looking for a 24/7 emergency vet for my cat", "Medical Help",
                "My cat ingested something toxic. Seeking immediate recommendations in central Delhi/Noida area with emergency ICU facilities.",
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
                null, "Sneha Roy", 2L, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", 8, 5, "4h ago");

        createPost("Community Feeding Drive this Sunday morning!", "Feeding",
                "Volunteers gathering at 8 AM. Food bowls, fresh cooked rice-broth and pedigree bags will be provided to all attendees. Join hands for our indie friends!",
                "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
                null, "Paw Care Foundation", 3L, "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150", 24, 7, "6h ago");

        createPost("Adopt a loving rescue cat — Daisy is ready for a forever family", "Adoption",
                "1-year-old rescued indie-persian mix, fully vaccinated, spayed and litter trained. Extremely affectionate with kids.",
                "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80",
                null, "Happy Paws Rescue", 4L, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", 19, 4, "8h ago");

        // 7. Seed Activities
        createActivity("You marked the case 'Injured Dog' as resolved", "2 hours ago");
        createActivity("You contacted NGO 'Paw Care Foundation'", "4 hours ago");
        createActivity("You updated the status for 'Stray Cat (sick)'", "5 hours ago");
        createActivity("You completed a rescue at Sector 18", "1 day ago");

        // 8. Seed Messages
        createMessage("Dr. Mehta", "Veterinarian",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
                "Can you share the photos of the injured dog?", "2m ago");

        createMessage("Paw Care Foundation", "NGO",
                "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=150&q=80",
                "We can provide a temporary shelter if needed.", "1h ago");

        createMessage("Volunteer Group", "Volunteer Group",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                "3 more volunteers are available today.", "3h ago");
    }

    private void createRescue(String animalType, String description, String location, String photoUrl,
                              UrgencyLevel urgency, RescueStatus status, User reportedBy, User assignedRescuer) {
        RescueRequest req = new RescueRequest();
        req.setAnimalType(animalType);
        req.setDescription(description);
        req.setLocation(location);
        req.setPhotoUrl(photoUrl);
        req.setUrgency(urgency);
        req.setStatus(status);
        req.setReportedBy(reportedBy);
        req.setAssignedRescuer(assignedRescuer);
        req.setCreatedAt(LocalDateTime.now().minusHours((long) (Math.random() * 48)));
        rescueRequestRepository.save(req);
    }

    private void createProvider(String name, String type, String distance, String address, String phone, String action,
                                Double rating, String website, Double lat, Double lng, String directionsUrl) {
        HelpProvider p = new HelpProvider();
        p.setName(name);
        p.setType(type);
        p.setDistance(distance);
        p.setAddress(address);
        p.setPhone(phone);
        p.setActionLabel(action);
        p.setRating(rating);
        p.setWebsite(website);
        p.setOpenNow(true);
        p.setLatitude(lat);
        p.setLongitude(lng);
        p.setDirectionsUrl(directionsUrl);
        helpProviderRepository.save(p);
    }

    private void createPost(String title, String category, String description, String photoUrl, String videoUrl,
                            String author, Long authorId, String authorAvatar, Integer likes, Integer comments, String timeAgo) {
        CommunityPost post = new CommunityPost();
        post.setTitle(title);
        post.setCategory(category);
        post.setDescription(description);
        post.setPhotoUrl(photoUrl);
        post.setVideoUrl(videoUrl);
        post.setAuthorName(author);
        post.setAuthorId(authorId);
        post.setAuthorAvatar(authorAvatar);
        post.setLikesCount(likes);
        post.setCommentsCount(comments);
        post.setTimeAgo(timeAgo);
        communityPostRepository.save(post);
    }

    private void createActivity(String description, String timeAgo) {
        RescueActivity a = new RescueActivity();
        a.setDescription(description);
        a.setTimeAgo(timeAgo);
        rescueActivityRepository.save(a);
    }

    private void createMessage(String senderName, String role, String avatarUrl, String preview, String timeAgo) {
        MessageRecord m = new MessageRecord();
        m.setSenderName(senderName);
        m.setSenderRole(role);
        m.setAvatarUrl(avatarUrl);
        m.setMessagePreview(preview);
        m.setTimeAgo(timeAgo);
        messageRepository.save(m);
    }
}
