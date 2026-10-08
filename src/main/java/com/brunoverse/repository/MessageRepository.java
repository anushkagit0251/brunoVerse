package com.brunoverse.repository;

import com.brunoverse.entity.MessageRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<MessageRecord, Long> {
}
