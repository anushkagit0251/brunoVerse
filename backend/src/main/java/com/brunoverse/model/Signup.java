package com.brunoverse.model;

import jakarta.persistence.*;

/** A user volunteering for an opportunity (rescue squad, feeding drive, fostering…). */
@Entity
@Table(name = "volunteer_signups")
public class Signup extends BaseEntity {
    public String userId;
    public String oppId;
    public Long at;
}
