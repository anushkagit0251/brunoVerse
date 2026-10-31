package com.brunoverse.model;

import com.brunoverse.config.JsonListConverter;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/** Community post (rescue story, help request, feeding drive, adoption). */
@Entity
@Table(name = "posts")
public class Post extends BaseEntity {
    public String author;
    public String authorId;
    @Lob
    public String text;
    public String tag;
    @Column(length = 512)
    public String image;
    public Long at;
    public Integer likes;
    public Integer comments;
    public Boolean liked;
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> cmts = new ArrayList<>();
}
