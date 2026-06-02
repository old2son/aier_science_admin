<script setup lang="ts">
import { Money, TrendCharts, UserFilled, Warning } from '@element-plus/icons-vue'

const metrics = [
  { label: '今日访问', value: '12,846', icon: TrendCharts, change: '+12.5%' },
  { label: '活跃用户', value: '2,438', icon: UserFilled, change: '+8.2%' },
  { label: '成交金额', value: '¥386,420', icon: Money, change: '+5.7%' },
  { label: '待办事项', value: '18', icon: Warning, change: '3 urgent' },
]

const tasks = ['审核新用户资料', '确认本周运营报表', '更新系统公告', '处理待分配工单']
</script>

<template>
  <div class="admin-page">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <section v-for="item in metrics" :key="item.label" class="page-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">{{ item.label }}</p>
            <p class="mt-2 text-2xl font-semibold text-slate-950">{{ item.value }}</p>
            <p class="mt-2 text-xs font-medium text-emerald-600">{{ item.change }}</p>
          </div>
          <div class="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-600">
            <el-icon :size="22">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </div>
      </section>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <section class="page-panel">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900">业务趋势</h2>
          <el-tag type="success">本月</el-tag>
        </div>
        <div class="grid h-72 grid-cols-7 items-end gap-3 border-b border-slate-200 px-2">
          <div
            v-for="height in [34, 48, 42, 70, 62, 86, 74]"
            :key="height"
            class="rounded-t-md bg-brand-500"
            :style="{ height: `${height}%` }"
          />
        </div>
      </section>

      <section class="page-panel">
        <h2 class="mb-4 text-base font-semibold text-slate-900">待办</h2>
        <div>
          <div
            v-for="task in tasks"
            :key="task"
            class="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
          >
            <span class="text-sm text-slate-700">{{ task }}</span>
            <el-button link type="primary">处理</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
