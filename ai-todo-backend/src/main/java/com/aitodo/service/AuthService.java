package com.aitodo.service;

import com.aitodo.common.exception.BusinessException;
import com.aitodo.dto.*;
import com.aitodo.entity.User;
import com.aitodo.mapper.UserMapper;
import com.aitodo.security.JwtService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername()));

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .avatar(user.getAvatar())
                        .build())
                .build();
    }

    public void register(RegisterRequest request) {
        User existingUser = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername()));

        if (existingUser != null) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setStatus(1);

        userMapper.insert(user);
    }

    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new BusinessException(401, "Refresh Token 无效或已过期");
        }

        String tokenType = jwtService.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new BusinessException(401, "无效的 Token 类型");
        }

        Long userId = jwtService.getUserIdFromToken(refreshToken);
        String username = jwtService.getUsernameFromToken(refreshToken);

        User user = userMapper.selectById(userId);
        if (user == null || user.getStatus() != 1) {
            throw new BusinessException(401, "用户不存在或已被禁用");
        }

        String newAccessToken = jwtService.generateAccessToken(userId, username);
        String newRefreshToken = jwtService.generateRefreshToken(userId, username);

        jwtService.blacklistToken(refreshToken);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .avatar(user.getAvatar())
                        .build())
                .build();
    }

    public void logout(String accessToken, String refreshToken) {
        jwtService.blacklistToken(accessToken);
        jwtService.blacklistToken(refreshToken);
    }
}
