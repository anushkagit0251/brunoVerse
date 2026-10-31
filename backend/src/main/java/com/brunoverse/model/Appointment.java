package com.brunoverse.model;

import jakarta.persistence.*;

/** Veterinary consultation booking (clinic, home visit or video call). */
@Entity
@Table(name = "appointments")
public class Appointment extends BaseEntity {
    public String ownerId;
    public String petId;
    public String vetId;
    public String vetName;
    /** clinic | video | home */
    public String mode;
    public String date;
    public String time;
    @Lob
    public String reason;
    @Column(length = 512)
    public String file;
    /** confirmed | cancelled | done */
    public String status;
    public Long createdAt;
}
