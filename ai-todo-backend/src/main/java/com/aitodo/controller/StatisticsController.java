package com.aitodo.controller;

import com.aitodo.common.Result;
import com.aitodo.dto.StatisticsResponse;
import com.aitodo.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/overview")
    public Result<StatisticsResponse> getOverview() {
        return Result.success(statisticsService.getOverview());
    }
}
