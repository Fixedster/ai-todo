
# 项目一：智能待办清单（AI Todo）
## 需求规格说明书 (PRD)

---

### 1. 项目概述

| 项目 | 说明 |
|------|------|
| 项目名称 | AI Todo - 智能待办清单 |
| 技术栈 | React 19 + TypeScript 6 + Vite + Ant Design 6 / Tailwind CSS 4 + Spring Boot 3.2 + Java 17 + MySQL 8 + Redis 7 |
| 项目周期 | 2-3 周（个人开发） |
| 目标用户 | 个人开发者、学生、需要任务管理的职场新人 |
| 核心亮点 | AI 任务拆解、番茄钟专注、数据可视化、JWT 双 Token 认证、动态主题色 |

---

### 2. 功能需求

#### 2.1 用户认证模块
- **注册**：用户名（3-20 字符）、密码（6+ 字符）、邮箱（可选）
- **登录**：JWT 双 Token 机制
  - Access Token：有效期 2 小时
  - Refresh Token：有效期 7 天
  - 双 Token 均存储于 localStorage
  - Redis 存储 Token 黑名单（按 jti），支持登出失效
- **Token 自动续期**：Axios 响应拦截器检测 401 状态码，自动用 Refresh Token 换取新的 Access Token；并发请求排队等待刷新完成
- **登出**：清除客户端 Token，Redis 加入黑名单
- **用户信息**：侧边栏顶部显示用户名 + 头像，下拉菜单进入个人中心或退出

#### 2.2 任务管理模块（核心）
- **任务 CRUD**
  - 创建任务：标题（必填）、描述、优先级（高/中/低）、截止日期、标签（多选输入）、父任务 ID（可选，支持子任务）、排序权重
  - 编辑任务：弹出 Modal 全字段更新
  - 删除任务：软删除（is_deleted 字段 + Popconfirm 确认），定时任务凌晨 2:00 物理清除 30 天前的已删记录
  - 查询任务：支持按状态（待办/进行中/已完成/已归档）、优先级、标签、日期范围筛选；关键词搜索标题和描述
- **任务状态流转**：待办 → 进行中 → 已完成 → 已归档（四态流转）
  - 已完成的任务可"重新打开"回到待办
  - 可单独操作"归档"
- **批量操作**：多选后出现操作栏，支持批量完成、批量删除
- **卡片展示**：每条任务以 Card 展示，左侧彩色边框标识优先级，可操作完成/编辑/删除/归档

#### 2.3 AI 智能辅助模块
- **AI 任务拆解**：输入复杂任务描述（如"准备 Java 面试"），调用 AI 接口生成子任务建议列表
  - 前端 Modal 展示建议列表，每条建议含标题和优先级标签
  - 用户可勾选部分建议，一键"创建选中任务"
  - 后端 /api/ai/batch-create 批量写入
- **降级方案**：AI 服务不可用或超时，返回预设模板（根据关键词匹配面试/学习/旅行/通用模板）

#### 2.4 番茄钟专注模块
- **计时器**：SVG 圆形进度环，支持 15/25/45/60 分钟专注 + 5/10/15 分钟休息
- **任务关联**：专注开始前可从下拉菜单绑定任务
- **控制**：开始 / 暂停 / 继续 / 重置 / 打断
- **统计存储**：每次专注记录（开始时间、设定时长、实际时长、是否完成）存入 pomodoro_record 表
- **记录列表**：卡片下方展示最近 10 条专注记录，区分完成/打断状态

#### 2.5 数据可视化模块
- **仪表盘**（首页）：
  - 4 个统计卡片：总任务数 / 已完成 / 待处理 / 今日专注(分钟)
  - 今日任务列表：显示当天待办和进行中的任务
  - 优先级分布：彩色进度条 + 百分比 + shimmer 扫光动画 + 入场动画
- **统计页**（/statistics）：
  - 本周专注时长 + 总专注次数统计卡片
  - 本周任务完成趋势柱状图（按天统计，展示新建 vs 已完成）
  - 优先级分布进度条（带圆点指示器、百分比、渐变填充）
  - 标签使用频率：彩色 Tag 展示，字号随频次增大
- **数据降级**：后端接口无数据时自动填充 Mock 数据，保证页面完整展示

#### 2.6 系统配置模块
- **主题切换**：亮色 / 暗色模式，即时切换无刷新
- **主题色**：10 种预设主题色（拂晓蓝 / 极客蓝 / 酱紫 / 洋红 / 赤红 / 日暮橙 / 金盏黄 / 极光绿 / 青碧 / 深湖蓝），点击即时切换
- **通知设置**：任务到期提醒（浏览器 Notification API），可选提前 15/30/60/120 分钟
- **数据导出**：支持导出为 JSON / CSV 格式

#### 2.7 个人中心
- **信息展示**：头像、用户名、账号状态、注册时间、邮箱
- **信息编辑**：内联表单编辑用户名和邮箱

---

### 3. 非功能需求

| 类别 | 要求 |
|------|------|
| 性能 | 任务列表页首屏加载 < 1s，接口响应 < 200ms（Redis 缓存热点数据） |
| 安全 | SQL 注入防护（MyBatis-Plus 参数化查询）、BCrypt 密码加密、JWT 签名验证 |
| 用户体验 | 卡片悬浮效果（上移+阴影）、进度条扫光动画、毛玻璃登录背景、统一圆角体系 |
| 可维护性 | 前端 Zustand 状态管理 + 组件化，后端 Controller-Service-Mapper 分层清晰 |
| 部署 | Docker Compose 一键启动（MySQL + Redis + Spring Boot + Nginx 前端） |

---

### 4. 数据库设计

#### 4.1 用户表 (sys_user)
```sql
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT 'BCrypt加密密码',
    email VARCHAR(50) COMMENT '邮箱',
    avatar VARCHAR(200) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态：0禁用 1启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.2 任务表 (todo_task)
```sql
CREATE TABLE todo_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '所属用户',
    title VARCHAR(100) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述',
    priority TINYINT DEFAULT 1 COMMENT '优先级：0低 1中 2高',
    status TINYINT DEFAULT 0 COMMENT '状态：0待办 1进行中 2已完成 3已归档',
    due_date DATE COMMENT '截止日期',
    parent_id BIGINT DEFAULT NULL COMMENT '父任务ID，支持子任务',
    tags JSON COMMENT '标签数组，如["工作","学习"]',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    is_deleted TINYINT DEFAULT 0 COMMENT '软删除标记',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_status (user_id, status, is_deleted),
    INDEX idx_due_date (due_date),
    INDEX idx_priority (priority),
    FULLTEXT INDEX ft_title_desc (title, description) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.3 番茄钟记录表 (pomodoro_record)
```sql
CREATE TABLE pomodoro_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    task_id BIGINT COMMENT '关联任务ID',
    duration INT NOT NULL COMMENT '设定时长（分钟）',
    actual_duration INT COMMENT '实际专注时长（分钟）',
    status TINYINT DEFAULT 0 COMMENT '0完成 1打断',
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_time (user_id, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.4 Token 黑名单
```
Redis Set: token:blacklist:{jti} -> expire 7d
```

---

### 5. 接口设计（RESTful）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 注册 | POST | /api/auth/register | |
| 登录 | POST | /api/auth/login | 返回双 Token |
| 刷新 Token | POST | /api/auth/refresh | 用 Refresh Token 换新的 Access Token |
| 登出 | POST | /api/auth/logout | 加入黑名单 |
| 获取当前用户 | GET | /api/user/me | |
| 更新用户 | PUT | /api/user/update | 用户名/邮箱 |
| 创建任务 | POST | /api/tasks | |
| 任务列表 | GET | /api/tasks?page=1&size=20&status=0&priority=2 | 支持分页、多维度筛选 |
| 任务详情 | GET | /api/tasks/{id} | |
| 更新任务 | PUT | /api/tasks/{id} | |
| 删除任务 | DELETE | /api/tasks/{id} | 软删除 |
| 批量操作 | POST | /api/tasks/batch | 批量完成/删除 |
| 批量创建 | POST | /api/tasks/batch-create | AI 拆解后批量创建子任务 |
| AI 拆解任务 | POST | /api/ai/decompose | 请求：{"task":"准备Java面试"} |
| 开始番茄钟 | POST | /api/pomodoro/start | |
| 结束番茄钟 | POST | /api/pomodoro/{id}/end | |
| 番茄钟历史 | GET | /api/pomodoro/history | |
| 统计数据 | GET | /api/statistics/overview | Redis 缓存 5 分钟 |

---

### 6. 前端页面结构

```
/src
  /pages
    Login.tsx           # 登录/注册（毛玻璃背景 + 装饰色块）
    Dashboard.tsx       # 仪表盘（统计卡片 + 今日任务 + 优先级分布进度条）
    Tasks.tsx           # 任务列表（筛选栏 + 卡片列表 + 批量操作 + CRUD Modal）
    Pomodoro.tsx        # 番茄钟（SVG 进度环 + 计时器 + 专注记录列表）
    Statistics.tsx      # 数据统计（柱状图 + 进度条 + 标签频率）
    Settings.tsx        # 系统设置（主题/色/通知/数据导出）
    Profile.tsx         # 个人中心（信息展示 + 内联编辑）
  /components
    /common/Layout.tsx  # 侧边栏 + 顶栏 + 内容区（Outlet 嵌套路由）
    /ai/AIDecomposeModal.tsx  # AI 任务拆解弹窗
  /store
    authStore.ts        # 认证状态（持久化到 localStorage）
    taskStore.ts        # 任务状态（内存中，含筛选条件）
  /utils
    request.ts          # Axios 封装（自动 Token 刷新拦截器）
  App.tsx               # 根组件（ConfigProvider 主题控制 + 路由）
  main.tsx              # 入口（读取 localStorage 初始化主题/色）
```

---

### 7. 前端设计体系

#### 7.1 全局样式类
| 类名 | 用途 |
|------|------|
| `.hover-card` | 卡片悬浮上移 2px + 阴影增强 |
| `.page-header` | 页面标题栏（flex 布局，标题 + 右侧操作按钮） |
| `.stat-card` | 统计卡片顶部 3px 彩色渐变色条（blue/green/orange/red） |
| `.glass-card` | 毛玻璃效果（`backdrop-filter: blur`） |

#### 7.2 动画效果
| 动画 | 用途 |
|------|------|
| `shimmer` | 进度条扫光，白色光带从左到右循环 |
| `barIn` | 进度条入场，`scaleX(0)` → `scaleX(1)` |
| 悬浮上移 | `hover-card` 的 `translateY(-2px)` |

#### 7.3 主题系统
- 亮色/暗色模式通过 Ant Design ConfigProvider 的 `algorithm` 切换
- 主题色通过 `colorPrimary` token 控制，10 种预设色可选
- 自定义事件 `themeChange` 实现即时切换，无需页面刷新
- 所有偏好持久化到 localStorage

---

### 8. 后端架构

```
Controller 层 (REST API)
    ↓
Service 层 (业务逻辑)
    ↓
Mapper 层 (MyBatis-Plus 数据访问)
    ↓
MySQL 8 (持久化) + Redis 7 (缓存/黑名单)
```

#### 安全架构
- Spring Security + JWT 无状态认证
- JwtAuthenticationFilter 从请求头提取 Token 验证
- 双 Token 机制：Access Token（2h）+ Refresh Token（7d），均用 RSA 签名
- 并发请求处理：Axios 拦截器订阅-发布模式，401 时排队等待刷新

#### 缓存策略
- 统计接口：Redis 缓存 5 分钟
- 写入任务时清除统计缓存
- Token 黑名单：Redis Set，过期时间 7 天

#### 定时任务
- TaskCleanupJob：每日凌晨 2:00 物理删除 30 天前的软删除任务

---

### 9. 技术亮点（面试可展开）

1. **JWT 双 Token + Redis 黑名单**：解决单 Token 续期痛点，支持服务端强制登出；前端并发 401 排队等待刷新
2. **MySQL 全文搜索 + 复合索引**：任务标题描述使用 ngram 全文索引，筛选条件走覆盖索引
3. **Redis 缓存策略**：统计接口缓存 5 分钟 + 写入失效，Token 黑名单自动过期
4. **AI 降级设计**：AI 服务异常时返回关键词匹配的模板建议，保证核心功能可用
5. **动态主题系统**：通过自定义事件 + ConfigProvider 实现即时主题切换，无需刷新页面；10 种预设主题色
6. **进度条动画体系**：shimmer 扫光 + barIn 入场 + 光晕底层，纯 CSS 动画实现丰富视觉效果
7. **数据降级方案**：Dashboard 和 Statistics 在后端无数据时自动填充 Mock 数据，保证用户体验完整
8. **Docker Compose 全栈部署**：一键启动，包含数据卷持久化

---

### 10. 开发里程碑

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| Week 1 前半 | 3 天 | 后端基础：用户认证、任务 CRUD、数据库搭建 |
| Week 1 后半 | 3 天 | 前端基础：登录页、任务列表页、API 对接 |
| Week 2 前半 | 3 天 | 番茄钟、AI 模块、统计图表 |
| Week 2 后半 | 3 天 | 个人中心、主题色系统、UI 美化、Docker 部署 |
