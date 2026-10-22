package com.brunoverse.dto;

public class LearningRecommendation {
    private String id;
    private String title;
    private String category;
    private String summary;
    private String relevanceReason;
    private String link;
    private String image;

    public LearningRecommendation() {}

    public LearningRecommendation(String id, String title, String category, String summary, String relevanceReason, String link, String image) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.summary = summary;
        this.relevanceReason = relevanceReason;
        this.link = link;
        this.image = image;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRelevanceReason() {
        return relevanceReason;
    }

    public void setRelevanceReason(String relevanceReason) {
        this.relevanceReason = relevanceReason;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
