package com.brunoverse.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Vet clinic, NGO, shelter, rescuer or feeder in the help directory. */
@Entity
@Table(name = "places")
public class Place extends BaseEntity {
    /** vet | ngo | shelter | rescuer | feeder */
    public String type;
    public String name;
    public String phone;
    public Double lat;
    public Double lng;
    @JsonProperty("dLat")
    public Double dLat;
    @JsonProperty("dLng")
    public Double dLng;
    public String hours;
    public Boolean verified;
    public String services;
    public Double rating;
    public Boolean emergency;
    /** true when imported from OpenStreetMap */
    public Boolean osm;
}
