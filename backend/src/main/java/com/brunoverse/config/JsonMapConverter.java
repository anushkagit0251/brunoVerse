package com.brunoverse.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Map;

/** Stores small JSON objects (e.g. rescuer live location, read receipts) as text. */
@Converter
public class JsonMapConverter implements AttributeConverter<Map<String, Object>, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Object> value) {
        try {
            return value == null ? null : MAPPER.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot write JSON map", e);
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String db) {
        try {
            return db == null || db.isBlank() ? null : MAPPER.readValue(db, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot read JSON map", e);
        }
    }
}
