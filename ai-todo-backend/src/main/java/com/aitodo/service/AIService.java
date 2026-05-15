package com.aitodo.service;

import com.aitodo.dto.AIDecomposeRequest;
import com.aitodo.dto.AIDecomposeResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${deepseek.api-key}")
    private String apiKey;

    @Value("${deepseek.api-url}")
    private String apiUrl;

    @Value("${deepseek.model}")
    private String model;

    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            你是一个任务分解助手。用户会给你一个任务，你需要将其拆解为 3~6 个可执行的子任务。
            请严格以 JSON 数组格式返回，每个子任务包含以下字段：
            - title: 子任务标题（简短）
            - description: 子任务描述（一句话说明怎么做）
            - priority: 优先级（0=低, 1=中, 2=高）
            
            只返回 JSON 数组，不要返回其他任何文字、解释或 markdown 格式。
            示例格式：
            [{"title":"子任务1","description":"具体做法","priority":2},{"title":"子任务2","description":"具体做法","priority":1}]
            """;

    public AIDecomposeResponse decomposeTask(AIDecomposeRequest request) {
        try {
            return callDeepSeek(request.getTask());
        } catch (Exception e) {
            log.error("DeepSeek API call failed, using fallback", e);
            return getFallbackSuggestions(request.getTask());
        }
    }

    private AIDecomposeResponse callDeepSeek(String task) throws Exception {
        String requestBody = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("model", model);
            put("messages", List.of(
                    new java.util.LinkedHashMap<>() {{
                        put("role", "system");
                        put("content", SYSTEM_PROMPT);
                    }},
                    new java.util.LinkedHashMap<>() {{
                        put("role", "user");
                        put("content", "请帮我拆解这个任务：" + task);
                    }}
            ));
            put("temperature", 0.7);
            put("max_tokens", 1024);
        }});

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("DeepSeek API returned {}: {}", response.statusCode(), response.body());
            throw new RuntimeException("DeepSeek API error: " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").path(0).path("message").path("content").asText();

        String jsonStr = content.trim();
        if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        }
        jsonStr = jsonStr.trim();

        JsonNode suggestionsNode = objectMapper.readTree(jsonStr);
        List<AIDecomposeResponse.Suggestion> suggestions = new ArrayList<>();
        for (JsonNode node : suggestionsNode) {
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title(node.path("title").asText())
                    .description(node.path("description").asText())
                    .priority(node.path("priority").asInt(1))
                    .build());
        }

        return AIDecomposeResponse.builder()
                .originalTask(task)
                .suggestions(suggestions)
                .fallback(false)
                .build();
    }

    private AIDecomposeResponse getFallbackSuggestions(String task) {
        List<AIDecomposeResponse.Suggestion> suggestions = new ArrayList<>();
        String lowerTask = task.toLowerCase();

        if (lowerTask.contains("面试") || lowerTask.contains("interview")) {
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("准备简历和自我介绍")
                    .description("整理项目经验，准备1-2分钟的自我介绍")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("复习基础知识")
                    .description("复习核心技术知识点和常见面试题")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("刷算法题")
                    .description("每天刷3-5道LeetCode，重点复习常见数据结构和算法")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("模拟面试练习")
                    .description("找朋友或利用在线平台进行模拟面试")
                    .priority(1)
                    .build());
        } else if (lowerTask.contains("学习") || lowerTask.contains("study")) {
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("搜集学习资料")
                    .description("整理课程、书籍、文档等学习资源")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("制定学习计划")
                    .description("规划每天的学习内容和时间安排")
                    .priority(1)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("动手实践练习")
                    .description("通过实际项目或练习巩固所学知识")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("总结复盘")
                    .description("记录学习笔记，定期回顾和总结")
                    .priority(1)
                    .build());
        } else if (lowerTask.contains("旅行") || lowerTask.contains("travel")) {
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("确定目的地和行程")
                    .description("研究目的地，制定详细的行程计划")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("预订交通和住宿")
                    .description("提前预订机票/火车票和酒店")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("准备行李")
                    .description("根据天气和行程准备衣物和必需品")
                    .priority(1)
                    .build());
        } else {
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("明确目标和范围")
                    .description("梳理任务目标，明确要达成的结果和边界")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("拆解具体步骤")
                    .description("将任务分解为可执行的具体步骤")
                    .priority(2)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("分配时间和资源")
                    .description("为每个步骤分配合理的时间和所需资源")
                    .priority(1)
                    .build());
            suggestions.add(AIDecomposeResponse.Suggestion.builder()
                    .title("执行并检查进度")
                    .description("按计划执行，定期检查进度并调整")
                    .priority(1)
                    .build());
        }

        return AIDecomposeResponse.builder()
                .originalTask(task)
                .suggestions(suggestions)
                .fallback(true)
                .build();
    }
}
