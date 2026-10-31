package com.brunoverse.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

/** Stores nested lists (vaccinations, timeline, messages…) as JSON text – works on MySQL and H2. */
@Converter
public class JsonListConverter implements AttributeConverter<List<Object>, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Object> value) {
        try {
            return value == null ? null : MAPPER.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot write JSON list", e);
        }
    }

    @Override
    public List<Object> convertToEntityAttribute(String db) {
        try {
            return db == null || db.isBlank() ? new ArrayList<>() : MAPPER.readValue(db, new TypeReference<List<Object>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot read JSON list", e);
        }
    }
}
