package com.brunoverse.model;

import com.brunoverse.config.JsonListConverter;
import com.brunoverse.config.JsonMapConverter;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** A conversation between users (or a user and a clinic/NGO contact). */
@Entity
@Table(name = "chat_threads")
public class ChatThread extends BaseEntity {
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> members = new ArrayList<>();
    public String caseId;
    public String title;
    public String avatar;
    /** [{from, text, media, at}] */
    @Lob @Convert(converter = JsonListConverter.class)
    public List<Object> msgs = new ArrayList<>();
    /** userId -> last read timestamp */
    @Lob @Convert(converter = JsonMapConverter.class)
    public Map<String, Object> read;
}
