package com.aitodo.mapper;

import com.aitodo.entity.PomodoroRecord;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PomodoroMapper extends BaseMapper<PomodoroRecord> {
}
