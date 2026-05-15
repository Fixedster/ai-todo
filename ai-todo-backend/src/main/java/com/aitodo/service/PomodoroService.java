package com.aitodo.service;

import com.aitodo.common.exception.BusinessException;
import com.aitodo.dto.PomodoroEndRequest;
import com.aitodo.dto.PomodoroStartRequest;
import com.aitodo.entity.PomodoroRecord;
import com.aitodo.mapper.PomodoroMapper;
import com.aitodo.security.JwtService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PomodoroService {

    private final PomodoroMapper pomodoroMapper;
    private final JwtService jwtService;
    private final HttpServletRequest request;

    private Long getCurrentUserId() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录或登录已过期");
        }
        String token = authHeader.substring(7);
        return jwtService.getUserIdFromToken(token);
    }

    public PomodoroRecord startPomodoro(PomodoroStartRequest request) {
        PomodoroRecord record = new PomodoroRecord();
        record.setUserId(getCurrentUserId());
        record.setTaskId(request.getTaskId());
        record.setDuration(request.getDuration());
        record.setStatus(0);
        record.setStartTime(LocalDateTime.now());

        pomodoroMapper.insert(record);
        return record;
    }

    public PomodoroRecord endPomodoro(Long id, PomodoroEndRequest request) {
        PomodoroRecord record = pomodoroMapper.selectById(id);
        if (record == null || !record.getUserId().equals(getCurrentUserId())) {
            throw new BusinessException("记录不存在");
        }

        LocalDateTime endTime = LocalDateTime.now();
        record.setEndTime(endTime);

        long actualMinutes = Duration.between(record.getStartTime(), endTime).toMinutes();
        record.setActualDuration((int) actualMinutes);

        if (Boolean.TRUE.equals(request.getInterrupted())) {
            record.setStatus(1);
        } else {
            record.setStatus(0);
        }

        pomodoroMapper.updateById(record);
        return record;
    }

    public List<PomodoroRecord> getHistory() {
        LambdaQueryWrapper<PomodoroRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PomodoroRecord::getUserId, getCurrentUserId())
               .orderByDesc(PomodoroRecord::getStartTime);
        return pomodoroMapper.selectList(wrapper);
    }
}
