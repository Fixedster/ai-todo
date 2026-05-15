package com.aitodo.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BatchTaskRequest {
    @NotEmpty(message = "任务ID列表不能为空")
    private List<Long> ids;

    private String action;
    private Integer priority;
    private Integer status;
}
