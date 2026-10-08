package com.brunoverse.service;

public class GoogleAuthException extends RuntimeException {

    private final String errorCode;
    private final String details;

    public GoogleAuthException(String message) {
        super(message);
        this.errorCode = "GOOGLE_AUTH_ERROR";
        this.details = message;
    }

    public GoogleAuthException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.details = message;
    }

    public GoogleAuthException(String errorCode, String message, String details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details != null ? details : message;
    }

    public GoogleAuthException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.details = cause != null ? cause.getMessage() : message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getDetails() {
        return details;
    }
}
