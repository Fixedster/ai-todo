package com.aitodo.controller;

import com.aitodo.common.Result;
import com.aitodo.dto.AIDecomposeRequest;
import com.aitodo.dto.AIDecomposeResponse;
import com.aitodo.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/decompose")
    public Result<AIDecomposeResponse> decomposeTask(@Valid @RequestBody AIDecomposeRequest request) {
        return Result.success(aiService.decomposeTask(request));
    }
}
