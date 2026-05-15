-- 插入管理员账号 (密码: admin123, BCrypt加密)
INSERT IGNORE INTO sys_user (id, username, password, email, status, created_at) VALUES
(1, 'admin', '$2a$10$5EDc2uqLG2Ygllo75LixIuYyPu7Cq1rhdHQYJ0qJszzcv0wPn86cW', 'admin@example.com', 1, NOW());

-- 插入测试任务数据 (用户ID: 1)
INSERT INTO todo_task (user_id, title, description, priority, status, due_date, tags, created_at, updated_at) VALUES
(1, '完成项目需求文档', '整理并完善AI Todo项目的需求文档，包括功能模块和技术架构', 2, 2, '2026-05-10', '["文档", "重要"]', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 1 DAY),
(1, '设计数据库表结构', '根据需求设计用户表、任务表、标签表等核心表结构', 2, 2, '2026-05-11', '["数据库", "重要"]', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 2 DAY),
(1, '实现用户认证模块', '实现JWT双Token认证，包括登录、注册、刷新Token等功能', 2, 1, '2026-05-12', '["后端", "安全"]', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 1 DAY),
(1, '开发任务管理功能', '实现任务的增删改查、子任务分解、标签管理等功能', 1, 0, '2026-05-15', '["功能开发"]', NOW() - INTERVAL 4 DAY, NOW()),
(1, '集成AI任务分解能力', '调用AI接口实现智能任务分解，自动生成子任务列表', 2, 0, '2026-05-18', '["AI", "重要"]', NOW() - INTERVAL 3 DAY, NOW()),
(1, '实现番茄钟功能', '开发专注计时器，支持自定义时长、暂停、统计等功能', 1, 0, '2026-05-14', '["功能开发"]', NOW() - INTERVAL 2 DAY, NOW()),
(1, '数据统计与可视化', '实现任务完成统计、专注时长统计、标签分布等图表展示', 1, 0, '2026-05-20', '["统计", "可视化"]', NOW() - INTERVAL 1 DAY, NOW()),
(1, '系统设置功能', '实现主题切换、通知提醒、数据导出等系统设置', 0, 0, '2026-05-22', '["功能开发"]', NOW(), NOW()),
(1, '性能优化与测试', '进行性能测试，优化加载速度，完善单元测试', 1, 0, '2026-05-25', '["优化", "测试"]', NOW(), NOW()),
(1, '部署上线准备', '配置Docker Compose，准备生产环境部署文档', 2, 0, '2026-05-28', '["部署", "重要"]', NOW(), NOW()),
(1, '学习React Hooks', '深入学习和实践React Hooks的使用方法', 0, 2, '2026-05-05', '["学习", "前端"]', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 8 DAY),
(1, '配置开发环境', '安装Node.js、Java、MySQL等开发环境', 1, 2, '2026-05-06', '["环境"]', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 7 DAY),
(1, '设计UI原型图', '使用Figma设计应用界面原型', 1, 1, '2026-05-13', '["设计", "UI"]', NOW() - INTERVAL 5 DAY, NOW()),
(1, '编写API文档', '使用Swagger编写后端API接口文档', 0, 0, '2026-05-16', '["文档", "API"]', NOW() - INTERVAL 3 DAY, NOW()),
(1, '集成第三方登录', '实现微信、GitHub等第三方登录', 1, 0, '2026-05-19', '["功能开发", "第三方"]', NOW() - INTERVAL 2 DAY, NOW()),
(1, '实现文件上传', '开发头像上传、附件管理功能', 0, 0, '2026-05-21', '["功能开发"]', NOW() - INTERVAL 1 DAY, NOW()),
(1, '编写单元测试', '为核心业务逻辑编写单元测试用例', 1, 0, '2026-05-23', '["测试"]', NOW(), NOW()),
(1, '配置CI/CD', '设置GitHub Actions自动化部署流程', 2, 0, '2026-05-24', '["DevOps", "重要"]', NOW(), NOW()),
(1, '编写用户手册', '编写详细的用户使用手册和FAQ', 0, 0, '2026-05-26', '["文档"]', NOW(), NOW()),
(1, '安全审计', '进行代码安全审计，修复潜在漏洞', 2, 0, '2026-05-27', '["安全", "重要"]', NOW(), NOW());

-- 插入已完成任务的子任务
INSERT INTO todo_task (user_id, title, description, priority, status, parent_id, tags, created_at, updated_at) VALUES
(1, '完成需求文档初稿', '撰写第一版需求文档初稿', 1, 2, 1, '["文档"]', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 5 DAY),
(1, '需求评审会议', '组织团队进行需求评审', 2, 2, 1, '["会议"]', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 4 DAY),
(1, '修订需求文档', '根据评审意见修订文档', 1, 2, 1, '["文档"]', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY),
(1, '创建数据库ER图', '使用工具绘制数据库ER图', 1, 2, 2, '["设计"]', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 3 DAY),
(1, '编写建表SQL', '编写所有表的CREATE TABLE语句', 2, 2, 2, '["SQL"]', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY),
(1, '实现登录接口', 'POST /api/auth/login', 2, 2, 3, '["后端"]', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY),
(1, '实现注册接口', 'POST /api/auth/register', 2, 2, 3, '["后端"]', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY),
(1, '实现Token刷新', 'POST /api/auth/refresh', 1, 2, 3, '["后端"]', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY),
(1, 'useState学习', '学习useState的基本用法', 0, 2, 11, '["学习"]', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 9 DAY),
(1, 'useEffect学习', '学习useEffect副作用处理', 0, 2, 11, '["学习"]', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 8 DAY),
(1, '安装Node.js', '下载并安装Node.js LTS版本', 1, 2, 12, '["环境"]', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 8 DAY),
(1, '安装Java', '配置JDK 17开发环境', 1, 2, 12, '["环境"]', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 7 DAY);

-- 插入番茄钟记录
INSERT INTO pomodoro_record (user_id, task_id, duration, actual_duration, status, start_time, end_time, created_at) VALUES
(1, 3, 25, 25, 0, NOW() - INTERVAL 5 DAY - INTERVAL 2 HOUR, NOW() - INTERVAL 5 DAY - INTERVAL 1 HOUR - INTERVAL 35 MINUTE, NOW() - INTERVAL 5 DAY),
(1, 3, 25, 20, 1, NOW() - INTERVAL 4 DAY - INTERVAL 3 HOUR, NOW() - INTERVAL 4 DAY - INTERVAL 2 HOUR - INTERVAL 40 MINUTE, NOW() - INTERVAL 4 DAY),
(1, 4, 25, 25, 0, NOW() - INTERVAL 3 DAY - INTERVAL 1 HOUR, NOW() - INTERVAL 3 DAY - INTERVAL 35 MINUTE, NOW() - INTERVAL 3 DAY),
(1, 5, 45, 45, 0, NOW() - INTERVAL 2 DAY - INTERVAL 2 HOUR, NOW() - INTERVAL 2 DAY - INTERVAL 1 HOUR - INTERVAL 15 MINUTE, NOW() - INTERVAL 2 DAY),
(1, 6, 25, 25, 0, NOW() - INTERVAL 1 DAY - INTERVAL 4 HOUR, NOW() - INTERVAL 1 DAY - INTERVAL 3 HOUR - INTERVAL 35 MINUTE, NOW() - INTERVAL 1 DAY),
(1, NULL, 15, 15, 0, NOW() - INTERVAL 1 DAY - INTERVAL 1 HOUR, NOW() - INTERVAL 1 DAY - INTERVAL 45 MINUTE, NOW() - INTERVAL 1 DAY),
(1, 7, 25, 25, 0, NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 11 HOUR - INTERVAL 35 MINUTE, NOW() - INTERVAL 12 HOUR),
(1, 7, 25, 22, 1, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR - INTERVAL 38 MINUTE, NOW() - INTERVAL 6 HOUR),
(1, 11, 25, 25, 0, NOW() - INTERVAL 10 DAY - INTERVAL 2 HOUR, NOW() - INTERVAL 10 DAY - INTERVAL 1 HOUR - INTERVAL 35 MINUTE, NOW() - INTERVAL 10 DAY),
(1, 12, 25, 25, 0, NOW() - INTERVAL 9 DAY - INTERVAL 1 HOUR, NOW() - INTERVAL 9 DAY - INTERVAL 35 MINUTE, NOW() - INTERVAL 9 DAY),
(1, 1, 45, 45, 0, NOW() - INTERVAL 8 DAY - INTERVAL 3 HOUR, NOW() - INTERVAL 8 DAY - INTERVAL 2 HOUR - INTERVAL 15 MINUTE, NOW() - INTERVAL 8 DAY),
(1, 2, 25, 25, 0, NOW() - INTERVAL 7 DAY - INTERVAL 2 HOUR, NOW() - INTERVAL 7 DAY - INTERVAL 1 HOUR - INTERVAL 35 MINUTE, NOW() - INTERVAL 7 DAY),
(1, 13, 25, 25, 0, NOW() - INTERVAL 5 DAY - INTERVAL 4 HOUR, NOW() - INTERVAL 5 DAY - INTERVAL 3 HOUR - INTERVAL 35 MINUTE, NOW() - INTERVAL 5 DAY),
(1, 14, 15, 15, 0, NOW() - INTERVAL 4 DAY - INTERVAL 1 HOUR, NOW() - INTERVAL 4 DAY - INTERVAL 45 MINUTE, NOW() - INTERVAL 4 DAY),
(1, NULL, 25, 10, 1, NOW() - INTERVAL 3 DAY - INTERVAL 5 HOUR, NOW() - INTERVAL 3 DAY - INTERVAL 4 HOUR - INTERVAL 50 MINUTE, NOW() - INTERVAL 3 DAY);
