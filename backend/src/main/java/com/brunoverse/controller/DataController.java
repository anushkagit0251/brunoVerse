package com.brunoverse.controller;

import com.brunoverse.config.CurrentUser;
import com.brunoverse.model.AppMeta;
import com.brunoverse.model.AppUser;
import com.brunoverse.model.BaseEntity;
import com.brunoverse.model.Post;
import com.brunoverse.repository.MetaRepository;
import com.brunoverse.repository.UserRepository;
import com.brunoverse.service.DataRegistry;
import com.brunoverse.service.PolicyService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Sync API used by the web app.
 *  GET    /api/bootstrap              -> everything the logged-in user may see, in one response
 *  POST   /api/bootstrap/import       -> demo mode only: fill an empty database with demo data
 *  PUT    /api/data/{collection}/{id} -> create or update (checked by PolicyService)
 *  DELETE /api/data/{collection}/{id} -> delete (checked by PolicyService)
 */
@RestController
@RequestMapping("/api")
public class DataController {
    private final DataRegistry registry;
    private final ObjectMapper mapper;
    private final MetaRepository meta;
    private final UserRepository users;
    private final PolicyService policy;
    private final boolean demoData;

    public DataController(DataRegistry registry, ObjectMapper mapper, MetaRepository meta, UserRepository users,
                          PolicyService policy, @Value("${brunoverse.demo-data:true}") boolean demoData) {
        this.registry = registry;
        this.mapper = mapper;
        this.meta = meta;
        this.users = users;
        this.policy = policy;
        this.demoData = demoData;
    }

    @GetMapping("/bootstrap")
    public Map<String, Object> bootstrap(HttpServletRequest req) throws IOException {
        AppUser me = policy.user(CurrentUser.id(req));
        Map<String, Object> out = new LinkedHashMap<>();
        for (String name : registry.all().keySet()) {
            List<Object> visible = new ArrayList<>();
            for (BaseEntity e : registry.repo(name).findAll()) {
                if (!policy.canSee(name, e, me)) continue;
                visible.add(e instanceof AppUser u ? policy.publicView(u, me) : e);
            }
            out.put(name, visible);
        }
        AppMeta anchor = meta.findById("anchor").orElse(null);
        out.put("anchor", anchor == null || anchor.json == null ? null : mapper.readTree(anchor.json));
        return out;
    }

    /** Demo mode only: seeds an empty database with the sample data the app ships with. */
    @PostMapping("/bootstrap/import")
    @Transactional
    public ResponseEntity<?> importAll(@RequestBody Map<String, JsonNode> body, HttpServletRequest req) throws IOException {
        if (!demoData) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Demo data is turned off on this server"));
        if (users.count() > 0) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Database already has data"));
        for (Map.Entry<String, DataRegistry.Entry> e : registry.all().entrySet()) {
            JsonNode arr = body.get(e.getKey());
            if (arr == null || !arr.isArray()) continue;
            List<BaseEntity> items = new ArrayList<>();
            for (JsonNode n : arr) {
                BaseEntity item = mapper.treeToValue(n, e.getValue().type());
                if (item.id != null) items.add(item);
            }
            registry.repo(e.getKey()).saveAll(items);
        }
        if (body.get("anchor") != null && !body.get("anchor").isNull()) saveAnchor(body.get("anchor"));
        return ResponseEntity.ok(bootstrap(req));
    }

    @PutMapping("/data/{collection}/{id}")
    @Transactional
    public ResponseEntity<?> upsert(@PathVariable String collection, @PathVariable String id, @RequestBody JsonNode body,
                                    HttpServletRequest req) throws IOException {
        DataRegistry.Entry entry = registry.get(collection);
        if (entry == null) return error(HttpStatus.NOT_FOUND, "Unknown collection: " + collection);
        if (!body.isObject()) return error(HttpStatus.BAD_REQUEST, "Expected a JSON object");
        AppUser me = policy.user(CurrentUser.id(req));
        BaseEntity existing = registry.repo(collection).findById(id).orElse(null);
        String denied = policy.checkWrite(collection, me, existing, body);
        if (denied != null) return error(HttpStatus.FORBIDDEN, denied);

        ObjectNode data = (ObjectNode) body;
        boolean admin = policy.isAdmin(me);
        if (!admin) {
            if ("users".equals(collection)) data.remove("verified");
            if ("places".equals(collection)) data.put("verified", false);
            if ("posts".equals(collection) && existing != null && !me.id.equals(((Post) existing).authorId)) {
                data.retain("likes", "liked", "comments", "cmts"); // others may only like or comment
            }
        }
        BaseEntity entity = existing == null
                ? mapper.treeToValue(data, entry.type())
                : mapper.readerForUpdating(existing).readValue(data);
        entity.id = id;
        BaseEntity saved = registry.repo(collection).save(entity);
        return ResponseEntity.ok(saved instanceof AppUser u ? policy.publicView(u, me) : saved);
    }

    @DeleteMapping("/data/{collection}/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable String collection, @PathVariable String id, HttpServletRequest req) {
        if (registry.get(collection) == null) return error(HttpStatus.NOT_FOUND, "Unknown collection: " + collection);
        BaseEntity existing = registry.repo(collection).findById(id).orElse(null);
        if (existing == null) return ResponseEntity.noContent().build();
        String denied = policy.checkDelete(collection, policy.user(CurrentUser.id(req)), existing);
        if (denied != null) return error(HttpStatus.FORBIDDEN, denied);
        registry.repo(collection).deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/meta/anchor")
    public ResponseEntity<?> anchor(@RequestBody JsonNode body, HttpServletRequest req) throws IOException {
        if (!demoData && !policy.isAdmin(policy.user(CurrentUser.id(req)))) return ResponseEntity.ok(body);
        saveAnchor(body);
        return ResponseEntity.ok(body);
    }

    private void saveAnchor(JsonNode node) throws IOException {
        AppMeta m = new AppMeta();
        m.id = "anchor";
        m.json = mapper.writeValueAsString(node);
        meta.save(m);
    }

    private ResponseEntity<?> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
