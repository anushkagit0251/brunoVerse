package com.brunoverse.service;

import com.brunoverse.model.*;
import com.brunoverse.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Who may see and change what.
 * - Owners see and edit only their own pets, appointments, activity and notifications.
 * - Cases: anyone logged in can report; the reporter, the assigned rescuer and helper roles can update.
 * - Phone numbers are shared only for helpers (rescuers, vets, NGOs, feeders) who chose to be reachable.
 * - Admins (emails in ADMIN_EMAILS) verify organisations and can manage everything.
 */
@Service
public class PolicyService {
    private static final Set<String> HELPERS = Set.of("rescuer", "vet", "ngo");
    private static final Set<String> PUBLIC_PHONE_ROLES = Set.of("rescuer", "vet", "ngo", "feeder");

    private final UserRepository users;
    private final Set<String> adminEmails = new HashSet<>();

    public PolicyService(UserRepository users, @Value("${brunoverse.admin-emails:}") String admins) {
        this.users = users;
        for (String e : admins.split(",")) if (!e.isBlank()) adminEmails.add(e.trim().toLowerCase());
    }

    public AppUser user(String id) {
        return id == null ? null : users.findById(id).orElse(null);
    }

    public boolean isAdmin(AppUser u) {
        return u != null && u.email != null && adminEmails.contains(u.email.toLowerCase());
    }

    public boolean isHelper(AppUser u) {
        return u != null && HELPERS.contains(u.role);
    }

    /** What another person may see about a user. */
    public Map<String, Object> publicView(AppUser u, AppUser viewer) {
        boolean self = viewer != null && viewer.id.equals(u.id);
        boolean admin = isAdmin(viewer);
        boolean helper = PUBLIC_PHONE_ROLES.contains(u.role) && !Boolean.FALSE.equals(u.available);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.id);
        m.put("name", u.name);
        m.put("role", u.role);
        m.put("city", u.city);
        m.put("avatar", u.avatar);
        m.put("joined", u.joined);
        m.put("available", u.available);
        m.put("verified", u.verified);
        m.put("baseCompleted", u.baseCompleted);
        m.put("baseHelped", u.baseHelped);
        if (self || admin || helper) {
            m.put("phone", u.phone);
            m.put("lat", u.lat);
            m.put("lng", u.lng);
            m.put("dLat", u.dLat);
            m.put("dLng", u.dLng);
        }
        if (self || admin) m.put("email", u.email);
        m.values().removeIf(Objects::isNull);
        return m;
    }

    /** Can the viewer see this record in their app data? */
    public boolean canSee(String collection, BaseEntity e, AppUser me) {
        if (isAdmin(me)) return true;
        switch (collection) {
            case "places": case "posts": case "teams": case "users": return true;
            default: break;
        }
        if (me == null) return false;
        String id = me.id;
        return switch (collection) {
            case "cases" -> {
                RescueCase c = (RescueCase) e;
                yield !"resolved".equals(c.status) || id.equals(c.reporterId) || id.equals(c.rescuerId) || isHelper(me);
            }
            case "pets" -> id.equals(((Pet) e).ownerId);
            case "appointments" -> id.equals(((Appointment) e).ownerId);
            case "threads" -> ((ChatThread) e).members != null && ((ChatThread) e).members.contains(id);
            case "activity" -> id.equals(((Activity) e).userId);
            case "notifications" -> id.equals(((Notification) e).userId);
            case "signups" -> true; // used to count free volunteer spots
            default -> false;
        };
    }

    /** Returns null when the write is allowed, otherwise the reason. */
    public String checkWrite(String collection, AppUser me, BaseEntity existing, JsonNode body) {
        if (me == null) return "Please log in again";
        if (isAdmin(me)) return null;
        String id = me.id;
        boolean isNew = existing == null;
        switch (collection) {
            case "users":
                return !isNew && id.equals(existing.id) ? null : "You can only edit your own profile";
            case "pets":
                return owns(isNew ? text(body, "ownerId") : ((Pet) existing).ownerId, id) && sameOrMissing(body, "ownerId", id) ? null : "This pet belongs to someone else";
            case "appointments":
                return owns(isNew ? text(body, "ownerId") : ((Appointment) existing).ownerId, id) && sameOrMissing(body, "ownerId", id) ? null : "This booking belongs to someone else";
            case "cases":
                if (isNew) return id.equals(text(body, "reporterId")) ? null : "Report the case from your own account";
                RescueCase c = (RescueCase) existing;
                return id.equals(c.reporterId) || id.equals(c.rescuerId) || isHelper(me) ? null : "Only the reporter or a rescuer can update this case";
            case "threads": {
                List<Object> members = isNew ? null : ((ChatThread) existing).members;
                if (isNew) {
                    JsonNode m = body.get("members");
                    if (m != null && m.isArray()) for (JsonNode x : m) if (id.equals(x.asText())) return null;
                    return "You must be part of the conversation";
                }
                return members != null && members.contains(id) ? null : "You are not part of this conversation";
            }
            case "posts":
                return isNew && !id.equals(text(body, "authorId")) ? "Post from your own account" : null; // others' likes/comments are filtered
            case "activity":
                return owns(isNew ? text(body, "userId") : ((Activity) existing).userId, id) ? null : "Not allowed";
            case "signups":
                return owns(isNew ? text(body, "userId") : ((Signup) existing).userId, id) ? null : "Not allowed";
            case "notifications":
                return isNew || id.equals(((Notification) existing).userId) ? null : "Not allowed";
            case "teams":
                return owns(isNew ? text(body, "by") : ((Team) existing).by, id) ? null : "Only the team creator can edit it";
            case "places":
                return isNew ? null : "Only an admin can edit a listed organisation";
            default:
                return "Unknown collection";
        }
    }

    public String checkDelete(String collection, AppUser me, BaseEntity existing) {
        if (me == null) return "Please log in again";
        if (isAdmin(me)) return null;
        String id = me.id;
        boolean ok = switch (collection) {
            case "pets" -> id.equals(((Pet) existing).ownerId);
            case "appointments" -> id.equals(((Appointment) existing).ownerId);
            case "cases" -> id.equals(((RescueCase) existing).reporterId);
            case "threads" -> ((ChatThread) existing).members != null && ((ChatThread) existing).members.contains(id);
            case "posts" -> id.equals(((Post) existing).authorId);
            case "activity" -> id.equals(((Activity) existing).userId);
            case "signups" -> id.equals(((Signup) existing).userId);
            case "notifications" -> id.equals(((Notification) existing).userId);
            case "teams" -> id.equals(((Team) existing).by);
            default -> false;
        };
        return ok ? null : "You can't delete this";
    }

    private static boolean owns(String owner, String me) {
        return me.equals(owner);
    }

    private static boolean sameOrMissing(JsonNode body, String field, String me) {
        JsonNode v = body.get(field);
        return v == null || v.isNull() || me.equals(v.asText());
    }

    private static String text(JsonNode body, String field) {
        JsonNode v = body.get(field);
        return v == null || v.isNull() ? null : v.asText();
    }
}
