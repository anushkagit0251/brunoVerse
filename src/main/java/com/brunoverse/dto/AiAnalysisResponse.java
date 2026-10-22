package com.brunoverse.dto;

import java.util.List;

public class AiAnalysisResponse {
    private boolean success;
    private boolean configured;
    private String errorCode;
    private String message;
    private String apparentAnimalType;
    private String suggestedUrgency;
    private String suggestedCondition;
    private List<String> observations;
    private List<String> uncertainties;
    private List<String> safetyGuidance;
    private String generatedDescription;
    private List<String> relevantLearningIds;
    private List<LearningRecommendation> recommendedLessons;

    public AiAnalysisResponse() {}

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public boolean isConfigured() {
        return configured;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getApparentAnimalType() {
        return apparentAnimalType;
    }

    public void setApparentAnimalType(String apparentAnimalType) {
        this.apparentAnimalType = apparentAnimalType;
    }

    public String getSuggestedUrgency() {
        return suggestedUrgency;
    }

    public void setSuggestedUrgency(String suggestedUrgency) {
        this.suggestedUrgency = suggestedUrgency;
    }

    public String getSuggestedCondition() {
        return suggestedCondition;
    }

    public void setSuggestedCondition(String suggestedCondition) {
        this.suggestedCondition = suggestedCondition;
    }

    public List<String> getObservations() {
        return observations;
    }

    public void setObservations(List<String> observations) {
        this.observations = observations;
    }

    public List<String> getUncertainties() {
        return uncertainties;
    }

    public void setUncertainties(List<String> uncertainties) {
        this.uncertainties = uncertainties;
    }

    public List<String> getSafetyGuidance() {
        return safetyGuidance;
    }

    public void setSafetyGuidance(List<String> safetyGuidance) {
        this.safetyGuidance = safetyGuidance;
    }

    public String getGeneratedDescription() {
        return generatedDescription;
    }

    public void setGeneratedDescription(String generatedDescription) {
        this.generatedDescription = generatedDescription;
    }

    public List<String> getRelevantLearningIds() {
        return relevantLearningIds;
    }

    public void setRelevantLearningIds(List<String> relevantLearningIds) {
        this.relevantLearningIds = relevantLearningIds;
    }

    public List<LearningRecommendation> getRecommendedLessons() {
        return recommendedLessons;
    }

    public void setRecommendedLessons(List<LearningRecommendation> recommendedLessons) {
        this.recommendedLessons = recommendedLessons;
    }
}
