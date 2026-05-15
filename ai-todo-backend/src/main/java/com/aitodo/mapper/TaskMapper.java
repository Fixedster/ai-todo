package com.aitodo.mapper;

import com.aitodo.entity.Task;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TaskMapper extends BaseMapper<Task> {

    @Select("SELECT * FROM todo_task WHERE user_id = #{userId} AND is_deleted = 0 AND MATCH(title, description) AGAINST(#{keyword} IN NATURAL LANGUAGE MODE)")
    List<Task> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
}
