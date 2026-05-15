package com.aitodo.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AIDecomposeResponse {
    private String originalTask;
    private List<Suggestion> suggestions;
    private boolean fallback;

    @Data
    @Builder
    public static class Suggestion {
        private String title;
        private String description;
        private Integer priority;
    }
}
