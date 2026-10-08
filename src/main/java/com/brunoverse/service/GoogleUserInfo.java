package com.brunoverse.service;

public class GoogleUserInfo {

    private String email;
    private boolean emailVerified;
    private String name;
    private String picture;
    private String sub;
    private String aud;
    private String iss;
    private long exp;

    public GoogleUserInfo() {}

    public GoogleUserInfo(String email, boolean emailVerified, String name, String picture, String sub, String aud, String iss, long exp) {
        this.email = email;
        this.emailVerified = emailVerified;
        this.name = name;
        this.picture = picture;
        this.sub = sub;
        this.aud = aud;
        this.iss = iss;
        this.exp = exp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public String getSub() {
        return sub;
    }

    public void setSub(String sub) {
        this.sub = sub;
    }

    public String getAud() {
        return aud;
    }

    public void setAud(String aud) {
        this.aud = aud;
    }

    public String getIss() {
        return iss;
    }

    public void setIss(String iss) {
        this.iss = iss;
    }

    public long getExp() {
        return exp;
    }

    public void setExp(long exp) {
        this.exp = exp;
    }

    @Override
    public String toString() {
        return "GoogleUserInfo{" +
                "email='" + email + '\'' +
                ", emailVerified=" + emailVerified +
                ", name='" + name + '\'' +
                ", picture='" + picture + '\'' +
                ", sub='" + sub + '\'' +
                ", aud='" + aud + '\'' +
                ", iss='" + iss + '\'' +
                ", exp=" + exp +
                '}';
    }
}
