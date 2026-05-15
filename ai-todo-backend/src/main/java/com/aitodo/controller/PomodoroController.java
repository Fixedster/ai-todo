package com.aitodo.controller;

import com.aitodo.common.Result;
import com.aitodo.dto.PomodoroEndRequest;
import com.aitodo.dto.PomodoroStartRequest;
import com.aitodo.entity.PomodoroRecord;
import com.aitodo.service.PomodoroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @PostMapping("/start")
    public Result<PomodoroRecord> startPomodoro(@Valid @RequestBody PomodoroStartRequest request) {
        return Result.success(pomodoroService.startPomodoro(request));
    }

    @PostMapping("/{id}/end")
    public Result<PomodoroRecord> endPomodoro(@PathVariable Long id, @RequestBody PomodoroEndRequest request) {
        return Result.success(pomodoroService.endPomodoro(id, request));
    }

    @GetMapping("/history")
    public Result<List<PomodoroRecord>> getHistory() {
        return Result.success(pomodoroService.getHistory());
    }
}
