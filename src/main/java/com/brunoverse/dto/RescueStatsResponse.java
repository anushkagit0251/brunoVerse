package com.brunoverse.dto;

public class RescueStatsResponse {
    private long pendingCases;
    private long activeRescues;
    private long completed;
    private long totalAnimalsHelped;

    public RescueStatsResponse(long pendingCases, long activeRescues, long completed, long totalAnimalsHelped) {
        this.pendingCases = pendingCases;
        this.activeRescues = activeRescues;
        this.completed = completed;
        this.totalAnimalsHelped = totalAnimalsHelped;
    }

    public long getPendingCases() {
        return pendingCases;
    }

    public long getActiveRescues() {
        return activeRescues;
    }

    public long getCompleted() {
        return completed;
    }

    public long getTotalAnimalsHelped() {
        return totalAnimalsHelped;
    }
}
