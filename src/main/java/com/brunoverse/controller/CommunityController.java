package com.brunoverse.controller;

import com.brunoverse.entity.CommunityComment;
import com.brunoverse.entity.CommunityPost;
import com.brunoverse.repository.CommunityCommentRepository;
import com.brunoverse.repository.CommunityPostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityPostRepository communityPostRepository;
    private final CommunityCommentRepository communityCommentRepository;

    public CommunityController(CommunityPostRepository communityPostRepository,
                               CommunityCommentRepository communityCommentRepository) {
        this.communityPostRepository = communityPostRepository;
        this.communityCommentRepository = communityCommentRepository;
    }

    @GetMapping
    public List<CommunityPost> getAllPosts() {
        return communityPostRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<CommunityPost> createPost(@RequestBody CommunityPost post) {
        if (post.getCreatedAt() == null) {
            post.setCreatedAt(LocalDateTime.now());
        }
        if (post.getTimeAgo() == null || post.getTimeAgo().isBlank()) {
            post.setTimeAgo("Just now");
        }
        if (post.getLikesCount() == null) {
            post.setLikesCount(0);
        }
        if (post.getCommentsCount() == null) {
            post.setCommentsCount(0);
        }
        CommunityPost saved = communityPostRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommunityPost> updatePost(@PathVariable Long id, @RequestBody CommunityPost updated) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (updated.getTitle() != null && !updated.getTitle().isBlank()) post.setTitle(updated.getTitle());
        if (updated.getDescription() != null) post.setDescription(updated.getDescription());
        if (updated.getCategory() != null) post.setCategory(updated.getCategory());
        if (updated.getPhotoUrl() != null) post.setPhotoUrl(updated.getPhotoUrl().isBlank() ? null : updated.getPhotoUrl());
        if (updated.getVideoUrl() != null) post.setVideoUrl(updated.getVideoUrl().isBlank() ? null : updated.getVideoUrl());

        return ResponseEntity.ok(communityPostRepository.save(post));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        communityCommentRepository.deleteByPostId(id);
        communityPostRepository.delete(post);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<CommunityPost> toggleLike(@PathVariable Long id) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        post.setLikesCount(post.getLikesCount() + 1);
        return ResponseEntity.ok(communityPostRepository.save(post));
    }

    @GetMapping("/{id}/comments")
    public List<CommunityComment> getComments(@PathVariable Long id) {
        return communityCommentRepository.findByPostIdOrderByCreatedAtAsc(id);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommunityComment> addComment(@PathVariable Long id, @RequestBody CommunityComment comment) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        comment.setPostId(id);
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(LocalDateTime.now());
        }
        CommunityComment saved = communityCommentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        communityPostRepository.save(post);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
