package com.brunoverse.model;

import jakarta.persistence.*;

/** Entry in a user's "Recent Activity" feed. */
@Entity
@Table(name = "activities")
public class Activity extends BaseEntity {
    public String userId;
    @Column(length = 1024)
    public String text;
    public Long at;
    public String icon;
}
