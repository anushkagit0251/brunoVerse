package com.brunoverse.model;

import com.brunoverse.config.JsonListConverter;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/** Digital pet profile with vaccinations, medical records and reminders. */
@Entity
@Table(name = "pets")
public class Pet extends BaseEntity {
    public String ownerId;
    public String name;
    public String species;
    public String breed;
    public String gender;
    public String dob;
    public String weight;
    public String color;
    @Column(length = 512)
    public String photo;
    public String health;
    public String microchip;
    @Lob
    public String notes;
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> vaccinations = new ArrayList<>();
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> records = new ArrayList<>();
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> reminders = new ArrayList<>();
}
