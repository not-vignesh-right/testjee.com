<template>
  <div v-if="examStore.currentQuestion" class="space-y-6">
    <!-- Question Header -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="bg-gta-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            Question {{ examStore.currentQuestionIndex + 1 }} of {{ examStore.totalQuestions }}
          </span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {{ examStore.currentQuestion.subject }}
          </span>
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {{ examStore.currentQuestion.topic }}
          </span>
        </div>
        
        <!-- Question Status Indicators -->
        <div class="flex items-center space-x-2">
          <div v-if="examStore.questionStatuses[examStore.currentQuestion.id]?.marked" 
               class="flex items-center space-x-1 text-gta-purple">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="text-sm font-medium">Marked</span>
          </div>
          <div v-if="examStore.questionStatuses[examStore.currentQuestion.id]?.answered" 
               class="flex items-center space-x-1 text-gta-success">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-medium">Answered</span>
          </div>
        </div>
      </div>
      
      <!-- Question Content -->
      <div class="space-y-4">
        <!-- Question Image (if available) -->
        <div v-if="examStore.currentQuestion.image_url" class="mb-4">
          <img 
            :src="examStore.currentQuestion.image_url" 
            :alt="`Question ${examStore.currentQuestionIndex + 1}`"
            class="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
            style="max-height: 600px; object-fit: contain;"
          />
        </div>
        
        <!-- Question Text (shown if no image or as supplement) -->
        <div v-if="examStore.currentQuestion.text" class="prose max-w-none">
          <p class="text-lg text-gray-800 leading-relaxed">
            {{ examStore.currentQuestion.text }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Options / Numeric Input -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <template v-if="examStore.currentQuestion.question_type === 'multiple_choice'">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Select the correct answer:</h3>
          <span v-if="examStore.userAnswers[examStore.currentQuestion.id]" class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">Answer Saved</span>
          <span v-else-if="examStore.draftAnswers[examStore.currentQuestion.id]" class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">Not Saved (Click Save & Next)</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="option in examStore.currentQuestion.options"
            :key="option.id"
            @click="selectOption(option.id)"
            :class="[
              'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center group',
              { 
                // Saved answer styling
                'border-green-500 bg-green-50 shadow-sm': examStore.userAnswers[examStore.currentQuestion.id] === option.id,
                
                // Draft answer styling (selected but not saved)
                'border-blue-500 bg-blue-50 shadow-sm': examStore.draftAnswers[examStore.currentQuestion.id] === option.id && examStore.userAnswers[examStore.currentQuestion.id] !== option.id,
                
                // Unselected styling
                'border-gray-200 hover:border-blue-300 hover:bg-gray-50': 
                  examStore.userAnswers[examStore.currentQuestion.id] !== option.id && 
                  examStore.draftAnswers[examStore.currentQuestion.id] !== option.id 
              }
            ]"
          >
            <div class="flex items-center space-x-3 w-full">
              <!-- Radio Button Circle -->
              <div 
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                :class="[
                  examStore.userAnswers[examStore.currentQuestion.id] === option.id ? 'border-green-500' :
                  examStore.draftAnswers[examStore.currentQuestion.id] === option.id ? 'border-blue-500' :
                  'border-gray-300 group-hover:border-blue-400'
                ]"
              >
                <!-- Inner Dot -->
                <div 
                  v-if="examStore.userAnswers[examStore.currentQuestion.id] === option.id" 
                  class="w-3 h-3 bg-green-500 rounded-full"
                ></div>
                <div 
                  v-else-if="examStore.draftAnswers[examStore.currentQuestion.id] === option.id" 
                  class="w-3 h-3 bg-blue-500 rounded-full"
                ></div>
              </div>
              <span class="font-bold whitespace-nowrap" :class="[
                  examStore.userAnswers[examStore.currentQuestion.id] === option.id ? 'text-green-800' :
                  examStore.draftAnswers[examStore.currentQuestion.id] === option.id ? 'text-blue-800' :
                  'text-gray-700'
              ]">{{ option.id.toUpperCase() }}.</span>
              <span class="text-gray-800 flex-1">{{ option.text }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Enter your answer (Numeric):</h3>
          <span v-if="examStore.userAnswers[examStore.currentQuestion.id]" class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">Answer Saved</span>
          <span v-else-if="examStore.draftAnswers[examStore.currentQuestion.id]" class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">Not Saved (Click Save & Next)</span>
        </div>
        <div class="flex items-center space-x-3">
          <input
            type="text"
            class="w-52 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gta-primary"
            placeholder="e.g. 3.142"
            v-model="numericDraft"
          />
        </div>
        <div class="text-sm text-gray-600 mt-2">Only first 5 numericals per subject will be counted.</div>
      </template>
    </div>
    
    <!-- Navigation Footer -->
    <FooterNav />
  </div>
  
  <!-- Loading State -->
  <div v-else class="flex items-center justify-center h-64">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gta-primary mx-auto mb-4"></div>
      <p class="text-gray-600">Loading exam questions...</p>
    </div>
  </div>
</template>

<script setup>
import { useExamStore } from '../stores/examStore'
import FooterNav from './FooterNav.vue'

import { ref, watch, computed } from 'vue'
const examStore = useExamStore()

const numericDraft = computed({
  get() {
    const q = examStore.currentQuestion
    return q ? examStore.getNumericDraft(q.id) : ''
  },
  set(v) {
    const q = examStore.currentQuestion
    if (q) examStore.setNumericDraft(q.id, v)
  }
})

watch(() => examStore.currentQuestion?.id, () => {
  const q = examStore.currentQuestion
  if (q && q.question_type === 'numeric') {
    const saved = examStore.userAnswers[q.id]
    if (typeof saved !== 'undefined') {
      examStore.setNumericDraft(q.id, String(saved))
    }
  }
})

const selectOption = (optionId) => {
  const questionId = examStore.currentQuestion.id
  // Only select draft, don't save. User must click "Save & Next"
  examStore.selectDraftAnswer(questionId, optionId)
}

// Numeric saving is handled by the footer's Save & Next
</script> 