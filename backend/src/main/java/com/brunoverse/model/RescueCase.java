package com.brunoverse.model;

import com.brunoverse.config.JsonListConverter;
import com.brunoverse.config.JsonMapConverter;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** An animal in need reported by someone, with GPS, photos/videos and a status timeline. */
@Entity
@Table(name = "rescue_cases")
public class RescueCase extends BaseEntity {
    public String reporterId;
    public String reporterName;
    public String reporterPhone;
    public String animal;
    public String title;
    /** Urgent | Medical Help | Needs Shelter | Food Needed | Rescue Needed | Resolved */
    public String needs;
    /** critical | urgent | moderate (AI triage) */
    public String urgency;
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> condition = new ArrayList<>();
    @Lob
    public String description;
    public Double lat;
    public Double lng;
    @JsonProperty("dLat")
    public Double dLat;
    @JsonProperty("dLng")
    public Double dLng;
    @Column(length = 1024)
    public String address;
    /** photo / video URLs */
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> media = new ArrayList<>();
    public Long createdAt;
    /** reported | accepted | on_the_way | reached | treatment | resolved */
    public String status;
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> timeline = new ArrayList<>();
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> updates = new ArrayList<>();
    public String rescuerId;
    public String rescuerName;
    public String rescuerPhone;
    /** live location of the rescuer {lat, lng, at} */
    @Lob @Convert(converter = JsonMapConverter.class)
    public Map<String, Object> rescuerLoc;
    @Column(length = 1024)
    public String aiSummary;
}
