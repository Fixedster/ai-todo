package com.aitodo.controller;

import com.aitodo.common.Result;
import com.aitodo.entity.User;
import com.aitodo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public Result<User> getCurrentUser() {
        return Result.success(userService.getCurrentUser());
    }

    @PutMapping("/update")
    public Result<Void> updateUser(@RequestBody User user) {
        userService.updateUser(user);
        return Result.success(null);
    }
}
