package com.brunoverse.model;

import jakarta.persistence.*;

/** A local rescue team started from "Every Rescue Matters". */
@Entity
@Table(name = "rescue_teams")
public class Team extends BaseEntity {
    public String name;
    public String area;
    public Integer members;
    public String phone;
    public String by;
    public Long at;
}
