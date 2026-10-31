package com.brunoverse.service;

import com.brunoverse.model.*;
import com.brunoverse.repository.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Maps the collection names used by the frontend ("pets", "cases"…) to their JPA entity and repository.
 * Used by the generic sync API so the web app can save any record with one endpoint.
 */
@Service
public class DataRegistry {

    public record Entry(Class<? extends BaseEntity> type, JpaRepository<? extends BaseEntity, String> repo) {}

    private final Map<String, Entry> entries = new LinkedHashMap<>();

    public DataRegistry(UserRepository users, PlaceRepository places, CaseRepository cases, PetRepository pets,
                        AppointmentRepository appointments, ThreadRepository threads, PostRepository posts,
                        ActivityRepository activity, NotificationRepository notifications,
                        SignupRepository signups, TeamRepository teams) {
        entries.put("users", new Entry(AppUser.class, users));
        entries.put("places", new Entry(Place.class, places));
        entries.put("cases", new Entry(RescueCase.class, cases));
        entries.put("pets", new Entry(Pet.class, pets));
        entries.put("appointments", new Entry(Appointment.class, appointments));
        entries.put("threads", new Entry(ChatThread.class, threads));
        entries.put("posts", new Entry(Post.class, posts));
        entries.put("activity", new Entry(Activity.class, activity));
        entries.put("notifications", new Entry(Notification.class, notifications));
        entries.put("signups", new Entry(Signup.class, signups));
        entries.put("teams", new Entry(Team.class, teams));
    }

    public Map<String, Entry> all() { return entries; }

    public Entry get(String collection) { return entries.get(collection); }

    @SuppressWarnings("unchecked")
    public JpaRepository<BaseEntity, String> repo(String collection) {
        return (JpaRepository<BaseEntity, String>) entries.get(collection).repo();
    }
}
