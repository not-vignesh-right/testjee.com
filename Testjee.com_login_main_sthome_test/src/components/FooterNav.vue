<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <!-- Left Section: Previous Button -->
      <button
        @click="examStore.previousQuestion"
        :disabled="examStore.currentQuestionIndex === 0"
        :class="[
          'nav-button',
          examStore.currentQuestionIndex === 0 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'nav-button-secondary'
        ]"
      >
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Previous</span>
        </div>
      </button>
      
      <!-- Center Section: Action Buttons -->
      <div class="flex items-center space-x-3">
        <!-- Clear Response -->
        <button
          @click="clearResponse"
          class="nav-button nav-button-danger"
        >
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span>Clear Response</span>
          </div>
        </button>
        
        <!-- Mark for Review & Next -->
        <button
          @click="markForReviewAndNext"
          class="nav-button nav-button-secondary"
        >
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>Mark for Review & Next</span>
          </div>
        </button>
        
        <!-- Save & Next -->
        <button
          @click="saveAndNext"
          class="nav-button nav-button-primary"
        >
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Save & Next</span>
          </div>
        </button>
      </div>
      
      <!-- Right Section: Next Button -->
      <button
        @click="examStore.nextQuestion"
        :disabled="examStore.currentQuestionIndex === examStore.totalQuestions - 1"
        :class="[
          'nav-button',
          examStore.currentQuestionIndex === examStore.totalQuestions - 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'nav-button-secondary'
        ]"
      >
        <div class="flex items-center space-x-2">
          <span>Next</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </button>
    </div>
    
    <!-- Progress Bar -->
    <div class="mt-4">
      <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Progress: {{ examStore.answeredCount }} of {{ examStore.totalQuestions }} answered</span>
        <span>{{ Math.round((examStore.answeredCount / examStore.totalQuestions) * 100) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-gta-success h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(examStore.answeredCount / examStore.totalQuestions) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useExamStore } from '../stores/examStore'

const examStore = useExamStore()

const clearResponse = () => {
  const questionId = examStore.currentQuestion.id
  examStore.clearResponse(questionId)
}

const markForReviewAndNext = async () => {
  const q = examStore.currentQuestion
  if (!q) return
  const questionId = q.id
  
  // If there's a draft, commit it first
  if (examStore.draftAnswers[questionId] !== undefined) {
    if (q.question_type === 'numeric') {
      const draft = examStore.getNumericDraft(questionId)
      const value = String((draft ?? '').toString().trim())
      if (value !== '') {
        const res = await examStore.commitAnswer(questionId)
        if (res && res.success === false && res.reason === 'numeric_limit_reached') {
          alert('You have already answered 5 numericals for this subject.')
          return
        }
      }
    } else {
      await examStore.commitAnswer(questionId)
    }
  }

  examStore.markForReview(questionId)
  examStore.nextQuestion()
}

const saveAndNext = async () => {
  const q = examStore.currentQuestion
  if (!q) return
  const questionId = q.id
  
  if (examStore.draftAnswers[questionId] !== undefined) {
    if (q.question_type === 'numeric') {
      const draft = examStore.getNumericDraft(questionId)
      const value = String((draft ?? '').toString().trim())
      if (value !== '') {
        const res = await examStore.commitAnswer(questionId)
        if (res && res.success === false && res.reason === 'numeric_limit_reached') {
          alert('You have already answered 5 numericals for this subject.')
          return
        }
      }
    } else {
      await examStore.commitAnswer(questionId)
    }
  }
  
  // If they click Save & Next but already had an answer saved (and no new draft), just move to next
  examStore.nextQuestion()
}
</script> 