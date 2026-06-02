<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  siteName: 'Aier Admin',
  enableAudit: true,
  pageSize: 20,
  notice: '欢迎使用后台管理系统',
})
</script>

<template>
  <div class="admin-page">
    <section class="page-panel max-w-3xl">
      <h2 class="mb-5 text-base font-semibold text-slate-900">基础设置</h2>
      <el-form :model="settings" label-width="110px">
        <el-form-item label="系统名称">
          <el-input v-model="settings.siteName" />
        </el-form-item>
        <el-form-item label="审计日志">
          <el-switch v-model="settings.enableAudit" />
        </el-form-item>
        <el-form-item label="分页数量">
          <el-input-number v-model="settings.pageSize" :min="10" :max="100" :step="10" />
        </el-form-item>
        <el-form-item label="系统公告">
          <el-input v-model="settings.notice" :rows="4" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存设置</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>
