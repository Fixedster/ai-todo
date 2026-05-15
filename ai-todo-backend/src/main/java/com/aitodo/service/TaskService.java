package com.aitodo.service;

import com.aitodo.common.PageResult;
import com.aitodo.common.exception.BusinessException;
import com.aitodo.dto.BatchTaskRequest;
import com.aitodo.dto.TaskRequest;
import com.aitodo.entity.Task;
import com.aitodo.mapper.TaskMapper;
import com.aitodo.security.JwtService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskMapper taskMapper;
    private final JwtService jwtService;
    private final HttpServletRequest request;
    private final StatisticsService statisticsService;

    private Long getCurrentUserId() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录或登录已过期");
        }
        String token = authHeader.substring(7);
        return jwtService.getUserIdFromToken(token);
    }

    public Task createTask(TaskRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BusinessException("任务标题不能为空");
        }
        Task task = new Task();
        task.setUserId(getCurrentUserId());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : 1);
        task.setStatus(request.getStatus() != null ? request.getStatus() : 0);
        task.setDueDate(request.getDueDate());
        task.setParentId(request.getParentId());
        task.setTags(request.getTags());
        task.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        task.setIsDeleted(0);

        taskMapper.insert(task);
        statisticsService.invalidateCache();
        return task;
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = taskMapper.selectById(id);
        if (task == null || !task.getUserId().equals(getCurrentUserId())) {
            throw new BusinessException("任务不存在");
        }

        UpdateWrapper<Task> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", id);

        if (request.getTitle() != null) {
            updateWrapper.set("title", request.getTitle());
        }
        if (request.getDescription() != null) {
            updateWrapper.set("description", request.getDescription());
        }
        if (request.getPriority() != null) {
            updateWrapper.set("priority", request.getPriority());
        }
        if (request.getStatus() != null) {
            updateWrapper.set("status", request.getStatus());
        }
        if (request.getDueDate() != null) {
            updateWrapper.set("due_date", request.getDueDate());
        }
        if (request.getParentId() != null) {
            updateWrapper.set("parent_id", request.getParentId());
        }
        if (request.getTags() != null) {
            try {
                updateWrapper.set("tags", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request.getTags()));
            } catch (Exception e) {
                updateWrapper.set("tags", request.getTags().toString());
            }
        }
        if (request.getSortOrder() != null) {
            updateWrapper.set("sort_order", request.getSortOrder());
        }
        updateWrapper.set("updated_at", java.time.LocalDateTime.now());

        taskMapper.update(null, updateWrapper);
        statisticsService.invalidateCache();
        return taskMapper.selectById(id);
    }

    public void deleteTask(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null || !task.getUserId().equals(getCurrentUserId())) {
            throw new BusinessException("任务不存在");
        }

        UpdateWrapper<Task> uw = new UpdateWrapper<>();
        uw.eq("id", id).set("is_deleted", 1).set("updated_at", java.time.LocalDateTime.now());
        taskMapper.update(null, uw);
        statisticsService.invalidateCache();
    }

    public Task getTask(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null || !task.getUserId().equals(getCurrentUserId()) || task.getIsDeleted() == 1) {
            throw new BusinessException("任务不存在");
        }
        return task;
    }

    public PageResult<Task> listTasks(Integer status, Integer priority, String keyword, String tag,
                                       String startDate, String endDate, Long page, Long size) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getUserId, getCurrentUserId())
               .eq(Task::getIsDeleted, 0);

        if (status != null) {
            wrapper.eq(Task::getStatus, status);
        }
        if (priority != null) {
            wrapper.eq(Task::getPriority, priority);
        }
        if (StringUtils.hasText(startDate) && StringUtils.hasText(endDate)) {
            wrapper.between(Task::getDueDate, startDate, endDate);
        }
        if (StringUtils.hasText(tag)) {
            wrapper.like(Task::getTags, tag);
        }

        wrapper.orderByDesc(Task::getCreatedAt);

        Page<Task> pageParam = new Page<>(page != null ? page : 1, size != null ? size : 20);
        Page<Task> result = taskMapper.selectPage(pageParam, wrapper);

        List<Task> records = result.getRecords();

        if (StringUtils.hasText(keyword)) {
            try {
                List<Task> searchResults = taskMapper.searchByKeyword(getCurrentUserId(), keyword);
                final List<Task> finalRecords = records;
                records = searchResults.stream()
                        .filter(t -> finalRecords.stream().anyMatch(r -> r.getId().equals(t.getId())))
                        .toList();
            } catch (Exception e) {
                final String finalKeyword = keyword;
                records = records.stream()
                        .filter(t -> t.getTitle().contains(finalKeyword) || 
                                (t.getDescription() != null && t.getDescription().contains(finalKeyword)))
                        .toList();
            }
        }

        return PageResult.of(result.getTotal(), pageParam.getCurrent(), pageParam.getSize(), records);
    }

    public void batchOperate(BatchTaskRequest request) {
        Long userId = getCurrentUserId();
        List<Task> tasks = taskMapper.selectBatchIds(request.getIds());

        for (Task task : tasks) {
            if (!task.getUserId().equals(userId)) {
                throw new BusinessException("无权操作部分任务");
            }
        }

        switch (request.getAction()) {
            case "complete":
                for (Long id : request.getIds()) {
                    UpdateWrapper<Task> uw = new UpdateWrapper<>();
                    uw.eq("id", id).set("status", 2).set("updated_at", java.time.LocalDateTime.now());
                    taskMapper.update(null, uw);
                }
                break;
            case "delete":
                for (Long id : request.getIds()) {
                    UpdateWrapper<Task> uw = new UpdateWrapper<>();
                    uw.eq("id", id).set("is_deleted", 1).set("updated_at", java.time.LocalDateTime.now());
                    taskMapper.update(null, uw);
                }
                break;
            case "updatePriority":
                if (request.getPriority() != null) {
                    for (Long id : request.getIds()) {
                        UpdateWrapper<Task> uw = new UpdateWrapper<>();
                        uw.eq("id", id).set("priority", request.getPriority()).set("updated_at", java.time.LocalDateTime.now());
                        taskMapper.update(null, uw);
                    }
                }
                break;
            default:
                throw new BusinessException("未知的操作类型");
        }
        statisticsService.invalidateCache();
    }

    public void batchCreateTasks(List<TaskRequest> requests) {
        for (TaskRequest req : requests) {
            createTask(req);
        }
    }
}
