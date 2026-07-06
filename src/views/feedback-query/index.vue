<template>
	<router-view v-slot="{ Component, route }">
		<keep-alive :exclude="cachedViews">
			<component :is="Component" :key="route.name" />
		</keep-alive>
	</router-view>
</template>

<script setup lang="ts">
const cachedViews = ['FeedbackQueryAnalytics'];
</script>
