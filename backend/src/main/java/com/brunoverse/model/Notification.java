package com.brunoverse.model;

import jakarta.persistence.*;

/** In-app notification (new case nearby, rescuer accepted, vaccine due…). */
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {
    public String userId;
    @Column(length = 1024)
    public String text;
    public Long at;
    public Boolean read;
    public String link;
}
