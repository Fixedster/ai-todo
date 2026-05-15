package com.aitodo.service;

import com.aitodo.common.exception.BusinessException;
import com.aitodo.entity.User;
import com.aitodo.mapper.UserMapper;
import com.aitodo.security.JwtService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
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

    public User getCurrentUser() {
        User user = userMapper.selectById(getCurrentUserId());
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    public void updateUser(User user) {
        Long userId = getCurrentUserId();
        User existingUser = userMapper.selectById(userId);
        if (existingUser == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            existingUser.setUsername(user.getUsername());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        userMapper.updateById(existingUser);
    }
}
