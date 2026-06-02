<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import { ref } from 'vue'

const keyword = ref('')

const users = [
  { id: 1001, name: '陈晨', department: '运营部', role: '运营经理', status: '启用' },
  { id: 1002, name: '李明', department: '产品部', role: '产品专员', status: '启用' },
  { id: 1003, name: '王晓', department: '客服部', role: '客服主管', status: '停用' },
  { id: 1004, name: '赵琳', department: '财务部', role: '财务人员', status: '启用' },
]
</script>

<template>
  <div class="admin-page">
    <section class="page-panel">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <el-input
          v-model="keyword"
          :prefix-icon="Search"
          class="max-w-sm"
          clearable
          placeholder="搜索姓名、部门或角色"
        />
        <el-button :icon="Plus" type="primary">新增用户</el-button>
      </div>

      <el-table :data="users" row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="110" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="department" label="部门" min-width="140" />
        <el-table-column prop="role" label="角色" min-width="140" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default>
            <el-button link type="primary">编辑</el-button>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>
