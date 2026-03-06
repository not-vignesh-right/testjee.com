<template>
  <div class="space-y-4">
    <!-- Palette Header -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Question Palette</h3>
      <p class="text-sm text-gray-600">Click any question number to navigate</p>
    </div>
    
    <!-- Legend -->
    <div class="bg-gray-50 rounded-lg p-4 space-y-2">
      <h4 class="font-medium text-gray-800 text-sm mb-3">Status Legend:</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span class="text-gray-600">Not Visited</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-red-500 border border-red-600 rounded"></div>
          <span class="text-gray-600">Not Answered</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
          <span class="text-gray-600">Answered</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-purple-500 border border-purple-600 rounded"></div>
          <span class="text-gray-600">Marked for Review</span>
        </div>
        <div class="flex items-center space-x-2 col-span-2">
          <div class="w-4 h-4 bg-purple-500 border-2 border-green-500 rounded relative"><span class="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full"></span></div>
          <span class="text-gray-600">Answered & Marked for Review</span>
        </div>
      </div>
    </div>
    
    <!-- Question Numbers Grouped by Subject -->
    <div class="space-y-4">
      <div v-for="group in groupedBySubject" :key="group.subject">
        <div class="flex items-center justify-between mb-1">
          <h4 class="font-semibold text-gray-800">{{ group.subject }}</h4>
          <div class="text-xs text-gray-500">{{ group.items.length }} questions</div>
        </div>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="item in group.items"
            :key="item.question.id"
            @click="goToQuestion(item.index)"
            :class="[
              'w-10 h-10 rounded-md font-bold text-sm flex items-center justify-center transition-all',
              getPaletteButtonClass(item.question.id)
            ]"
            :title="`Question ${item.index + 1}: ${item.question.subject} - ${item.question.topic}`"
          >
            {{ item.index + 1 }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div class="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <h4 class="font-medium text-gray-800 text-sm">Summary:</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="text-center">
          <div class="text-2xl font-bold text-gta-success">{{ examStore.answeredCount }}</div>
          <div class="text-gray-600">Answered</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gta-purple">{{ examStore.markedCount }}</div>
          <div class="text-gray-600">Marked</div>
        </div>
        <div class="text-center col-span-2">
          <div class="text-lg font-medium text-gray-800">
            {{ examStore.totalQuestions - examStore.answeredCount }} questions remaining
          </div>
        </div>
      </div>
    </div>
    
    <!-- Current Question Indicator -->
    <div v-if="examStore.currentQuestion" class="bg-gta-primary text-white rounded-lg p-3 text-center">
      <div class="text-sm">Currently Viewing</div>
      <div class="text-lg font-bold">Question {{ examStore.currentQuestionIndex + 1 }}</div>
      <div class="text-xs opacity-90">{{ examStore.currentQuestion.subject }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useExamStore } from '../stores/examStore'

const examStore = useExamStore()

const subjectOrder = ['Physics', 'Chemistry', 'Mathematics']

const groupedBySubject = computed(() => {
  const groupsMap = new Map()
  examStore.questions.forEach((q, i) => {
    if (!groupsMap.has(q.subject)) groupsMap.set(q.subject, [])
    groupsMap.get(q.subject).push({ question: q, index: i })
  })
  const orderedSubjects = [...groupsMap.keys()].sort((a, b) => {
    const ai = subjectOrder.indexOf(a)
    const bi = subjectOrder.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
  return orderedSubjects.map(s => ({ subject: s, items: groupsMap.get(s) }))
})

const goToQuestion = (index) => {
  examStore.goToQuestion(index)
}

const getPaletteButtonClass = (questionId) => {
  const status = examStore.questionStatuses[questionId]
  if (!status) return 'bg-gray-100 text-gray-700 border border-gray-300' // Not visited
  
  if (status.answered && status.marked) {
    return 'bg-purple-500 text-white border-2 border-green-500 shadow-inner' // Answered + Marked
  } else if (status.answered) {
    return 'bg-green-500 text-white border border-green-600 shadow-sm' // Answered (Saved)
  } else if (status.marked) {
    return 'bg-purple-500 text-white border border-purple-600 shadow-sm' // Marked (No answer)
  } else if (status.visited) {
    return 'bg-red-500 text-white border border-red-600 shadow-sm' // Visited but no answer saved
  } else {
    return 'bg-gray-100 text-gray-700 border border-gray-300' // Fallback
  }
}
</script> 