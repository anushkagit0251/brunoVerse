package com.brunoverse.controller;

import com.brunoverse.entity.MessageRecord;
import com.brunoverse.repository.MessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping
    public List<MessageRecord> getMessages() {
        return messageRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<MessageRecord> sendMessage(@RequestBody MessageRecord message) {
        MessageRecord saved = messageRepository.save(message);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
