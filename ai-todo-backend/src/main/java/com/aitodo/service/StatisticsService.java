package com.aitodo.service;

import com.aitodo.dto.StatisticsResponse;
import com.aitodo.entity.PomodoroRecord;
import com.aitodo.entity.Task;
import com.aitodo.mapper.PomodoroMapper;
import com.aitodo.mapper.TaskMapper;
import com.aitodo.security.JwtService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final TaskMapper taskMapper;
    private final PomodoroMapper pomodoroMapper;
    private final JwtService jwtService;
    private final HttpServletRequest request;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private Long getCurrentUserId() {
        String token = request.getHeader("Authorization").substring(7);
        return jwtService.getUserIdFromToken(token);
    }

    public void invalidateCache() {
        Long userId = getCurrentUserId();
        String cacheKey = "statistics:overview:" + userId;
        redisTemplate.delete(cacheKey);
    }

    @SneakyThrows
    public StatisticsResponse getOverview() {
        Long userId = getCurrentUserId();
        String cacheKey = "statistics:overview:" + userId;

        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return objectMapper.readValue(cached, StatisticsResponse.class);
        }

        StatisticsResponse response = buildStatistics(userId);
        redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(response), 5, TimeUnit.MINUTES);
        return response;
    }

    private StatisticsResponse buildStatistics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        LambdaQueryWrapper<Task> taskWrapper = new LambdaQueryWrapper<>();
        taskWrapper.eq(Task::getUserId, userId)
                   .eq(Task::getIsDeleted, 0);
        List<Task> allTasks = taskMapper.selectList(taskWrapper);

        long totalTasks = allTasks.size();
        long completedTasks = allTasks.stream().filter(t -> t.getStatus() == 2).count();
        long pendingTasks = allTasks.stream().filter(t -> t.getStatus() == 0 || t.getStatus() == 1).count();

        List<StatisticsResponse.WeeklyTrend> weeklyTrend = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            final LocalDate date = weekStart.plusDays(i);
            long completed = allTasks.stream()
                    .filter(t -> t.getUpdatedAt() != null)
                    .filter(t -> t.getStatus() == 2 && t.getUpdatedAt().toLocalDate().equals(date))
                    .count();
            long created = allTasks.stream()
                    .filter(t -> t.getCreatedAt() != null)
                    .filter(t -> t.getCreatedAt().toLocalDate().equals(date))
                    .count();
            weeklyTrend.add(StatisticsResponse.WeeklyTrend.builder()
                    .date(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                    .completed(completed)
                    .created(created)
                    .build());
        }

        List<StatisticsResponse.PriorityDistribution> priorityDistribution = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getPriority, Collectors.counting()))
                .entrySet().stream()
                .map(e -> StatisticsResponse.PriorityDistribution.builder()
                        .priority(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        Map<String, Long> tagCount = new HashMap<>();
        for (Task task : allTasks) {
            if (task.getTags() != null) {
                for (String tag : task.getTags()) {
                    tagCount.merge(tag, 1L, Long::sum);
                }
            }
        }
        List<StatisticsResponse.TagFrequency> tagFrequency = tagCount.entrySet().stream()
                .map(e -> StatisticsResponse.TagFrequency.builder()
                        .tag(e.getKey())
                        .count(e.getValue())
                        .build())
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());

        LambdaQueryWrapper<PomodoroRecord> pomodoroWrapper = new LambdaQueryWrapper<>();
        pomodoroWrapper.eq(PomodoroRecord::getUserId, userId);
        List<PomodoroRecord> pomodoroRecords = pomodoroMapper.selectList(pomodoroWrapper);

        int todayPomodoroMinutes = pomodoroRecords.stream()
                .filter(p -> p.getStartTime() != null && p.getStartTime().toLocalDate().equals(today))
                .filter(p -> p.getStatus() == 0)
                .mapToInt(PomodoroRecord::getActualDuration)
                .sum();

        double weeklyPomodoroHours = pomodoroRecords.stream()
                .filter(p -> p.getStartTime() != null)
                .filter(p -> !p.getStartTime().toLocalDate().isBefore(weekStart) && !p.getStartTime().toLocalDate().isAfter(weekEnd))
                .filter(p -> p.getStatus() == 0)
                .mapToInt(PomodoroRecord::getActualDuration)
                .sum() / 60.0;

        long totalFocusSessions = pomodoroRecords.stream().filter(p -> p.getStatus() == 0).count();

        return StatisticsResponse.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .todayPomodoroMinutes(todayPomodoroMinutes)
                .weeklyTrend(weeklyTrend)
                .priorityDistribution(priorityDistribution)
                .tagFrequency(tagFrequency)
                .weeklyPomodoroHours(Math.round(weeklyPomodoroHours * 10.0) / 10.0)
                .totalFocusSessions(totalFocusSessions)
                .build();
    }
}
