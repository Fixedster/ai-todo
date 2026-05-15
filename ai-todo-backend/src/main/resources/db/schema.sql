-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(20) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT 'BCrypt加密密码',
    email VARCHAR(50) COMMENT '邮箱',
    avatar VARCHAR(200) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态：0禁用 1启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 任务表
CREATE TABLE IF NOT EXISTS todo_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '所属用户',
    title VARCHAR(100) NOT NULL COMMENT '任务标题',
    description TEXT COMMENT '任务描述',
    priority TINYINT DEFAULT 1 COMMENT '优先级：0低 1中 2高',
    status TINYINT DEFAULT 0 COMMENT '状态：0待办 1进行中 2已完成 3已归档',
    due_date DATE COMMENT '截止日期',
    parent_id BIGINT DEFAULT NULL COMMENT '父任务ID，支持子任务',
    tags JSON COMMENT '标签数组',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    is_deleted TINYINT DEFAULT 0 COMMENT '软删除标记',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_status (user_id, status, is_deleted),
    INDEX idx_due_date (due_date),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 番茄钟记录表
CREATE TABLE IF NOT EXISTS pomodoro_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    task_id BIGINT COMMENT '关联任务ID',
    duration INT NOT NULL COMMENT '设定时长（分钟）',
    actual_duration INT COMMENT '实际专注时长（分钟）',
    status TINYINT DEFAULT 0 COMMENT '0完成 1打断',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_time (user_id, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='番茄钟记录表';
