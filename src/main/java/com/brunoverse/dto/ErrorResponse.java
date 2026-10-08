package com.brunoverse.dto;

import java.time.Instant;

public class ErrorResponse {
    private boolean success = false;
    private String error;
    private String message;
    private String details;
    private long timestamp = Instant.now().toEpochMilli();

    public ErrorResponse() {
        this.success = false;
        this.timestamp = Instant.now().toEpochMilli();
    }

    public ErrorResponse(String message) {
        this.success = false;
        this.error = "ERROR";
        this.message = message;
        this.details = message;
        this.timestamp = Instant.now().toEpochMilli();
    }

    public ErrorResponse(String error, String message, String details) {
        this.success = false;
        this.error = error;
        this.message = message;
        this.details = details != null ? details : message;
        this.timestamp = Instant.now().toEpochMilli();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
