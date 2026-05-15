package com.aitodo.schedule;

import com.aitodo.entity.Task;
import com.aitodo.mapper.TaskMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskCleanupJob {

    private final TaskMapper taskMapper;

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupDeletedTasks() {
        log.info("Starting deleted tasks cleanup job");
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Task::getIsDeleted, 1)
               .lt(Task::getUpdatedAt, thirtyDaysAgo);
        
        List<Task> tasksToDelete = taskMapper.selectList(wrapper);
        
        if (!tasksToDelete.isEmpty()) {
            for (Task task : tasksToDelete) {
                taskMapper.deleteById(task.getId());
            }
            log.info("Physically deleted {} tasks", tasksToDelete.size());
        } else {
            log.info("No tasks to clean up");
        }
    }
}
