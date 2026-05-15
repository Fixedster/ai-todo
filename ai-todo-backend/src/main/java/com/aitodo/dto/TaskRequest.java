package com.aitodo.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private Integer priority;
    private Integer status;
    private LocalDate dueDate;
    private Long parentId;
    private List<String> tags;
    private Integer sortOrder;
}
