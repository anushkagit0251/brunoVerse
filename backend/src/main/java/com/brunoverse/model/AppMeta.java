package com.brunoverse.model;

import jakarta.persistence.*;

/** Small key/value settings, e.g. the map anchor used to place demo data. */
@Entity
@Table(name = "app_meta")
public class AppMeta extends BaseEntity {
    @Lob
    public String json;
}
