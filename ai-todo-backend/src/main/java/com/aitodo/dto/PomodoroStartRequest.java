package com.aitodo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PomodoroStartRequest {
    private Long taskId;

    @NotNull(message = "时长不能为空")
    @Min(value = 1, message = "时长至少为1分钟")
    private Integer duration;
}
