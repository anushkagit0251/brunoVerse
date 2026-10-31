package com.brunoverse.model;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

/**
 * Every record uses a client-generated string id (e.g. "pet_k2j3h4"),
 * so the app can work offline and sync later.
 * Fields are public so JSON keys match the frontend 1:1.
 */
@MappedSuperclass
public abstract class BaseEntity {
    @Id
    @Column(length = 64)
    public String id;
}
