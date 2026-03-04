<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-md transition-all group"
      >
        <div class="flex items-center justify-between mb-3">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', stat.bgColor]">
            <component :is="stat.icon" :class="['w-5 h-5', stat.iconColor]" />
          </div>
          <span
            v-if="stat.badge"
            :class="['text-xs font-bold px-2 py-0.5 rounded-full', stat.badgeColor]"
          >{{ stat.badge }}</span>
        </div>
        <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
        <div class="text-sm text-gray-500 font-medium mt-0.5">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, computed } from 'vue'

const props = defineProps({
  totalStudents: { type: Number, default: 0 },
  pendingCount: { type: Number, default: 0 },
  approvedCount: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 }
})

// SVG icon components
const UsersIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' })
    ])
  }
}
const ClockIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  }
}
const CheckIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  }
}
const TestIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })
    ])
  }
}

const stats = computed(() => [
  {
    label: 'Total Students',
    value: props.totalStudents,
    icon: UsersIcon,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: null,
    badgeColor: ''
  },
  {
    label: 'Pending Approval',
    value: props.pendingCount,
    icon: ClockIcon,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badge: props.pendingCount > 0 ? 'Action Needed' : null,
    badgeColor: 'bg-amber-100 text-amber-700'
  },
  {
    label: 'Approved',
    value: props.approvedCount,
    icon: CheckIcon,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    badge: null,
    badgeColor: ''
  },
  {
    label: 'Total Tests Allocated',
    value: props.totalTests,
    icon: TestIcon,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    badge: null,
    badgeColor: ''
  }
])
</script>
