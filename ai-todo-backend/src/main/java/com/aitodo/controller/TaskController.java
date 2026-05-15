package com.aitodo.controller;

import com.aitodo.common.PageResult;
import com.aitodo.common.Result;
import com.aitodo.dto.BatchTaskRequest;
import com.aitodo.dto.TaskRequest;
import com.aitodo.entity.Task;
import com.aitodo.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public Result<Task> createTask(@Valid @RequestBody TaskRequest request) {
        return Result.success(taskService.createTask(request));
    }

    @GetMapping
    public Result<PageResult<Task>> listTasks(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long size) {
        return Result.success(taskService.listTasks(status, priority, keyword, tag, startDate, endDate, page, size));
    }

    @GetMapping("/{id}")
    public Result<Task> getTask(@PathVariable Long id) {
        return Result.success(taskService.getTask(id));
    }

    @PutMapping("/{id}")
    public Result<Task> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return Result.success(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return Result.success();
    }

    @PostMapping("/batch")
    public Result<Void> batchOperate(@Valid @RequestBody BatchTaskRequest request) {
        taskService.batchOperate(request);
        return Result.success();
    }

    @PostMapping("/batch-create")
    public Result<Void> batchCreateTasks(@Valid @RequestBody List<TaskRequest> requests) {
        taskService.batchCreateTasks(requests);
        return Result.success();
    }
}
