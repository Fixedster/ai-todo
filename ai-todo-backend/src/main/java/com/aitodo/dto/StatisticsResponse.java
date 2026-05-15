package com.aitodo.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StatisticsResponse {
    private Long totalTasks;
    private Long completedTasks;
    private Long pendingTasks;
    private Integer todayPomodoroMinutes;
    private List<WeeklyTrend> weeklyTrend;
    private List<PriorityDistribution> priorityDistribution;
    private List<TagFrequency> tagFrequency;
    private Double weeklyPomodoroHours;
    private Long totalFocusSessions;

    @Data
    @Builder
    public static class WeeklyTrend {
        private String date;
        private Long completed;
        private Long created;
    }

    @Data
    @Builder
    public static class PriorityDistribution {
        private Integer priority;
        private Long count;
    }

    @Data
    @Builder
    public static class TagFrequency {
        private String tag;
        private Long count;
    }
}
