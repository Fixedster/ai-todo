package com.aitodo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.aitodo.mapper")
@EnableScheduling
public class AiTodoApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiTodoApplication.class, args);
    }
}
