package com.aitodo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIDecomposeRequest {
    @NotBlank(message = "任务描述不能为空")
    private String task;
}
