<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div v-if="loading" class="flex justify-center my-20">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Main Results View -->
    <div v-else-if="sessionMeta" class="space-y-6">
      
      <!-- Header / Nav -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button @click="router.push('/admin/sessions')" class="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border bg-green-200">Completed</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 leading-tight flex items-center gap-3">
               {{ sessionMeta.session_name }} Results
               <span class="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-normal">CODE: {{ sessionMeta.session_code }}</span>
            </h1>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
           <button @click="exportCSV" class="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-colors gap-2 cursor-pointer">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export CSV
           </button>
        </div>
      </div>

      <!-- Quick Stats Strip -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-gray-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             <h3 class="text-sm font-medium">Students Appeared</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ submittedResults.length }} <span class="text-sm font-normal text-gray-500">of {{ sessionMeta.total_students_enrolled }}</span></div>
        </div>
        
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-blue-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             <h3 class="text-sm font-medium">Average Score</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ averageScore.toFixed(1) }} <span class="text-sm font-normal text-gray-500">/ {{ maxScore }}</span></div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-green-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
             <h3 class="text-sm font-medium">Highest Score</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ highestScore }} <span class="text-sm font-normal text-gray-500">/ {{ maxScore }}</span></div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-purple-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
             <h3 class="text-sm font-medium">Pass Rate (>40%)</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ passRateText }}%</div>
        </div>
      </div>

      <!-- Score Distribution -->
      <div v-if="submittedResults.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="font-bold text-gray-900 mb-4">Score Distribution</h3>
        <div class="flex items-end gap-1 h-24">
          <div v-for="bucket in scoreBuckets" :key="bucket.label"
            class="flex-1 bg-blue-500 hover:bg-blue-400 rounded-t transition-all cursor-default"
            :style="`height: ${bucket.heightPct}%`"
            :title="`${bucket.label}: ${bucket.count} students`">
          </div>
        </div>
        <div class="flex gap-1 mt-1 text-xs text-gray-400">
          <span v-for="bucket in scoreBuckets" :key="bucket.label" class="flex-1 text-center truncate">{{ bucket.label }}</span>
        </div>
      </div>

      <!-- Master Leaderboard Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900">Student Rankings & Leaderboard</h2>
          <div class="relative w-full sm:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, roll no, or user ID..."
              class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
            />
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
             <thead class="bg-gray-50 border-b border-gray-200">
               <tr>
                 <th class="p-4 font-semibold text-gray-600 w-24 text-center">Rank</th>
                 <th class="p-4 font-semibold text-gray-600">Student Name</th>
                 <th class="p-4 font-semibold text-gray-600 w-32">Status</th>
                 <th class="p-4 font-semibold text-gray-600 text-right w-32">Score</th>
                 <th class="p-4 font-semibold text-gray-600 text-right w-32">%</th>
                 <th class="p-4 font-semibold text-gray-600 text-right w-40">Time Taken</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-gray-100">
                <tr 
                   v-for="student in filteredResults" 
                   :key="student.username" 
                   class="transition-colors group"
                   :class="student.status !== 'not_started' ? 'hover:bg-gray-50/80 cursor-pointer' : 'opacity-75 bg-gray-50/20'"
                   @click="student.status !== 'not_started' && viewStudentAttempt(student)"
                >
                   
                   <td class="p-4 text-center">
                     <div class="flex items-center justify-center">
                       <span v-if="student.rank === 1" class="w-8 h-8 flex items-center justify-center bg-yellow-100 text-yellow-700 font-bold rounded-full shadow-sm text-lg">🥇</span>
                       <span v-else-if="student.rank === 2" class="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 font-bold rounded-full shadow-sm text-lg">🥈</span>
                       <span v-else-if="student.rank === 3" class="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-700 font-bold rounded-full shadow-sm text-lg">🥉</span>
                       <span v-else class="text-gray-500 font-semibold">{{ student.rank || '-' }}</span>
                     </div>
                   </td>
                   
                   <td class="p-4">
                     <div class="font-bold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors">{{ student.student_name || 'Anonymous' }}</div>
                     <div class="text-xs text-gray-500 font-mono">{{ student.username }} • {{ student.roll_number || 'No Roll' }}</div>
                   </td>
                   
                   <td class="p-4">
                     <span 
                      class="px-2 py-1 rounded text-xs font-bold uppercase"
                      :class="{
                        'bg-gray-100 text-gray-600': student.status === 'not_started',
                        'bg-blue-100 text-blue-800 border-blue-200': student.status === 'in_progress',
                        'bg-green-100 text-green-800 border-green-200': student.status === 'submitted',
                        'bg-orange-100 text-orange-800 border-orange-200': student.status === 'auto_submitted'
                      }"
                     >
                      {{ student.status === 'not_started' ? 'Did Not Attempt' : student.status === 'auto_submitted' ? 'Auto-Sub' : student.status.replace('_', ' ') }}
                     </span>
                   </td>
                   
                   <td class="p-4 text-right">
                     <span class="font-bold text-gray-900 text-base" :class="{'text-red-600': (student.percentage||0) < 40}">{{ student.score ?? '-' }}</span> 
                     <span class="text-gray-400 text-xs">/ {{ maxScore }}</span>
                   </td>
                   
                   <td class="p-4 text-right font-semibold text-gray-700">
                     {{ student.percentage ? Number(student.percentage).toFixed(1) + '%' : '-' }}
                   </td>
                   
                   <td class="p-4 text-right font-mono text-gray-600">
                     {{ formatDuration(student.time_taken_seconds) }}
                   </td>
                   
                </tr>
                <tr v-if="filteredResults.length === 0">
                   <td colspan="6" class="p-12 text-center text-gray-500">
                      {{ searchQuery.trim() ? 'No students match your search.' : 'No results data found.' }}
                   </td>
                </tr>
             </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>

  <!-- Drawer / Modal for Student's Detailed Attempt Breakdown -->
  <Teleport to="body">
    <div v-if="selectedStudent" class="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm" @click="selectedStudent = null">
      <div class="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-slide-in" @click.stop>
        <!-- Drawer Header -->
        <div class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <span class="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Detailed Student Review</span>
            <h3 class="text-xl font-bold text-gray-900 mt-1">{{ selectedStudent.student_name || 'Anonymous' }}</h3>
            <p class="text-xs font-mono text-gray-500 mt-0.5">{{ selectedStudent.username }} • Roll Code: {{ selectedStudent.roll_number || 'No Roll' }}</p>
          </div>
          <button @click="selectedStudent = null" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Drawer Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div v-if="loadingStudentDetails" class="flex flex-col items-center justify-center py-20">
            <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-gray-500 font-medium">Fetching detailed questions & responses...</p>
          </div>
          
          <template v-else-if="selectedStudentDetails.length > 0">
            <!-- Detailed stats row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
                <div class="text-xs font-bold text-gray-400 uppercase">Score</div>
                <div class="text-xl font-bold text-gray-900 mt-1">{{ selectedStudent.score ?? '-' }} / {{ maxScore }}</div>
              </div>
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
                <div class="text-xs font-bold text-gray-400 uppercase">Percentage</div>
                <div class="text-xl font-bold text-blue-600 mt-1">{{ selectedStudent.percentage ? Number(selectedStudent.percentage).toFixed(1) + '%' : '-' }}</div>
              </div>
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
                <div class="text-xs font-bold text-gray-400 uppercase">Rank</div>
                <div class="text-xl font-bold text-purple-600 mt-1">#{{ selectedStudent.rank || '-' }}</div>
              </div>
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
                <div class="text-xs font-bold text-gray-400 uppercase">Time Taken</div>
                <div class="text-xl font-bold text-gray-800 mt-1 font-mono">{{ formatDuration(selectedStudent.time_taken_seconds) }}</div>
              </div>
            </div>

            <!-- Grouped Grid breakdown -->
            <div v-for="(questions, subject) in selectedStudentGroupedBySubject" :key="subject" class="space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div class="w-6 h-6 rounded bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">{{ subject.charAt(0) }}</div>
                <h4 class="font-bold text-gray-850">{{ subject }}</h4>
                <span class="text-xs text-gray-400">({{ questions.length }} questions)</span>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="q in questions"
                  :key="q.question_id"
                  @click="selectedQuestion = q"
                  class="p-3 border rounded-xl hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  :class="getCardClass(q)"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" :class="getQNumberClass(q)">
                      {{ q.originalIndex + 1 }}
                    </span>
                    <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" :class="getStatusBadgeClass(q)">
                      {{ getQuestionStatusText(q) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center justify-between text-xs font-semibold mt-1">
                    <div>
                      <span class="text-gray-400">Student: </span>
                      <span :class="getAnswerTextColor(q)">{{ q.selected_answer ? q.selected_answer.toUpperCase() : '—' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Correct: </span>
                      <span class="text-green-600">{{ q.correct_answer ? q.correct_answer.toUpperCase() : '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <div v-else class="text-center py-20 text-gray-400">
            <p>No details found for this student session.</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal for Question Details -->
  <Teleport to="body">
    <div v-if="selectedQuestion" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="selectedQuestion = null">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" @click.stop>
        
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">Q{{ selectedQuestion.originalIndex + 1 }}</span>
            <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{{ selectedQuestion.subject_name }}</span>
            <span v-if="selectedQuestion.topic_name" class="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{{ selectedQuestion.topic_name }}</span>
            <span class="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full font-mono">{{ selectedQuestion.question_type === 'multiple_choice' ? 'MCQ' : 'Numeric' }}</span>
          </div>
          <button @click="selectedQuestion = null" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Status banner -->
          <div class="rounded-xl p-4 flex items-center justify-between border" :class="getQuestionModalBannerClass(selectedQuestion)">
            <div>
              <p class="text-xs font-black uppercase tracking-wider">{{ getQuestionModalStatusText(selectedQuestion) }}</p>
              <p class="text-sm font-medium text-gray-700 mt-0.5">{{ getQuestionModalStatusSubtitle(selectedQuestion) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 font-semibold uppercase">Time Spent</p>
              <p class="text-lg font-black font-mono">{{ formatDuration(selectedQuestion.time_spent_seconds) }}</p>
            </div>
          </div>

          <!-- Question Stem -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
              <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Question Stem</h3>
            </div>
            <div class="p-4">
              <img v-if="selectedQuestion.image_url" :src="selectedQuestion.image_url" alt="Question" class="max-w-full h-auto object-contain bg-white rounded-lg mx-auto max-h-80" />
              <p v-else class="text-gray-800 text-base leading-relaxed whitespace-pre-line">{{ selectedQuestion.question_content?.text || selectedQuestion.question_content?.stem || selectedQuestion.external_reference || 'No content.' }}</p>
            </div>
          </div>

          <!-- Choices / Numeric Answer -->
          <div v-if="selectedQuestion.question_type === 'multiple_choice'" class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
              <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Options</h3>
            </div>
            <div class="p-4 space-y-3">
              <div v-for="opt in getQuestionModalOptions(selectedQuestion)" :key="opt.id" class="flex items-start gap-3 p-3 rounded-lg border bg-white" :class="getModalOptClass(selectedQuestion, opt.id)">
                <div class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0" :class="getModalOptBadgeClass(selectedQuestion, opt.id)">
                  {{ opt.id.toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <img v-if="isUrl(opt.text)" :src="opt.text" class="max-w-full h-auto object-contain bg-white max-h-32" />
                  <p v-else class="text-sm font-medium leading-relaxed text-gray-700">{{ opt.text || '—' }}</p>
                </div>
                <!-- Status tags -->
                <div class="shrink-0 flex items-center gap-1.5 text-xs font-bold">
                  <span v-if="opt.id === selectedQuestion.correct_answer" class="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Correct</span>
                  <span v-if="opt.id === selectedQuestion.selected_answer && opt.id !== selectedQuestion.correct_answer" class="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Student Answer</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Numeric Field -->
          <div v-else-if="selectedQuestion.question_type === 'numeric'" class="grid grid-cols-2 gap-4">
            <div class="rounded-xl p-4 text-center border bg-white" :class="selectedQuestion.is_correct ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'">
              <p class="text-[10px] font-black uppercase tracking-wide text-gray-500">Student's Answer</p>
              <p class="text-2xl font-mono font-bold mt-1" :class="selectedQuestion.is_correct ? 'text-green-700' : 'text-red-700'">{{ selectedQuestion.selected_answer ?? '—' }}</p>
            </div>
            <div class="rounded-xl p-4 text-center border border-green-300 bg-green-50/30 bg-white">
              <p class="text-[10px] font-black uppercase tracking-wide text-green-600">Correct Answer</p>
              <p class="text-2xl font-mono font-bold text-green-700 mt-1">{{ selectedQuestion.correct_answer ?? '—' }}</p>
            </div>
          </div>

          <!-- Solution -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
              <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Solution / Explanation</h3>
            </div>
            <div class="p-4">
              <img v-if="selectedQuestion.solution && isUrl(selectedQuestion.solution)" :src="selectedQuestion.solution" alt="Solution" class="max-w-full h-auto object-contain bg-white rounded-lg mx-auto max-h-80" />
              <p v-else-if="selectedQuestion.solution" class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{{ selectedQuestion.solution }}</p>
              <p v-else class="text-gray-400 text-sm text-center py-2">No detailed explanation configured for this question.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAdminStore } from '../../stores/adminStore'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const loading = ref(true)
const sessionMeta = ref(null)
const results = ref([])

const selectedStudent = ref(null)
const selectedStudentDetails = ref([])
const loadingStudentDetails = ref(false)
const selectedQuestion = ref(null)

const sessionId = parseInt(route.params.id)

const selectedStudentGroupedBySubject = computed(() => {
  const groups = {}
  selectedStudentDetails.value.forEach((q, idx) => {
    const subject = q.subject_name || 'General'
    if (!groups[subject]) groups[subject] = []
    groups[subject].push({
      ...q,
      originalIndex: idx
    })
  })
  return groups
})

const viewStudentAttempt = async (student) => {
  if (student.status === 'not_started') return
  selectedStudent.value = student
  loadingStudentDetails.value = true
  selectedStudentDetails.value = []
  try {
    const { data: studentSessionId, error: sesErr } = await supabase.rpc('get_student_session_id_by_username', {
      p_live_session_id: sessionId,
      p_username: student.username,
      p_admin_token: adminStore.getToken()
    })

    if (sesErr) throw sesErr
    if (!studentSessionId) throw new Error('Student session not found')

    const { data, error } = await supabase.rpc('get_student_live_detailed_results', {
      input_student_session_id: studentSessionId,
      p_admin_token: adminStore.getToken()
    })
    if (error) throw error
    selectedStudentDetails.value = data || []
  } catch (err) {
    console.error('Failed to load student attempt details:', err)
  } finally {
    loadingStudentDetails.value = false
  }
}

onMounted(async () => {
  if (!adminStore.adminProfile?.admin_id) return
  
  try {
    // 1. Fetch meta
    const { data: metaData } = await supabase.rpc('get_admin_live_sessions', {
      input_admin_id: adminStore.adminProfile.admin_id
    })
    
    // Safety check map
    const theSession = metaData?.find(m => m.live_session_id === sessionId)
    if (!theSession) {
      router.push('/admin/sessions')
      return
    }

    sessionMeta.value = theSession
    
    // 2. Fetch specific results
    const { data: resultsData } = await supabase.rpc('get_session_results', {
       input_admin_id: adminStore.adminProfile.admin_id,
       input_live_session_id: sessionId
    })
    
    // NEW-01 fix: show every enrolled student (including those who never started),
    // not just ones who submitted — sorted rank-first, then unranked alphabetically.
    results.value = (resultsData || []).slice().sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank
      if (a.rank) return -1
      if (b.rank) return 1
      return (a.student_name || '').localeCompare(b.student_name || '')
    })

  } catch (err) {
    console.error('Results load error:', err)
  } finally {
    loading.value = false
  }
})

// BUG-07 / NEW-01 fix: `results` now includes every enrolled student (not just those who
// submitted), so the leaderboard table can show "Did Not Attempt" rows. But the summary
// stats below must stay scoped to students who actually have a score — otherwise a session
// with 2/20 submissions would show a misleadingly crashed average.
const submittedResults = computed(() =>
  results.value.filter(r => r.status === 'submitted' || r.status === 'auto_submitted')
)

// Computed Analytics
const maxScore = computed(() =>
  results.value.find(r => r.max_score)?.max_score ?? sessionMeta.value?.max_score ?? 300
)

const averageScore = computed(() => {
   if (submittedResults.value.length === 0) return 0
   const sum = submittedResults.value.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0)
   return sum / submittedResults.value.length
})

const highestScore = computed(() => {
  if (submittedResults.value.length === 0) return 0
  return Math.max(...submittedResults.value.map(s => Number(s.score) || 0))
})

const passRateText = computed(() => {
  if (submittedResults.value.length === 0) return 0
  const passes = submittedResults.value.filter(s => (Number(s.percentage) || 0) >= 40)
  return ((passes.length / submittedResults.value.length) * 100).toFixed(1)
})

// 4.4: Search filter over the full leaderboard (including "Did Not Attempt" rows)
const searchQuery = ref('')
const filteredResults = computed(() => {
  if (!searchQuery.value.trim()) return results.value
  const q = searchQuery.value.toLowerCase()
  return results.value.filter(s =>
    (s.student_name ?? '').toLowerCase().includes(q) ||
    (s.roll_number ?? '').toLowerCase().includes(q) ||
    (s.username ?? '').toLowerCase().includes(q)
  )
})

// 4.4: Score distribution (pure CSS, no chart library) — scoped to submitted students only
const scoreBuckets = computed(() => {
  const bucketCount = 10
  if (!submittedResults.value.length || !maxScore.value) return []
  const step = maxScore.value / bucketCount
  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    label: `${Math.round(i * step)}-${Math.round((i + 1) * step)}`,
    count: 0
  }))
  submittedResults.value.forEach(s => {
    if (s.score == null) return
    // Clamp both ends: JEE-style negative marking means score can go below 0, which would
    // otherwise produce a negative index and crash on buckets[idx].count++ below.
    const idx = Math.max(0, Math.min(Math.floor(Number(s.score) / step), bucketCount - 1))
    buckets[idx].count++
  })
  const maxCount = Math.max(...buckets.map(b => b.count), 1)
  return buckets.map(b => ({ ...b, heightPct: (b.count / maxCount) * 100 }))
})

const exportCSV = () => {
  const headers = ['Rank', 'Name', 'Roll No.', 'User ID', 'Score', 'Max Score', 'Percentage', 'Time Taken', 'Status']
  const rows = results.value.map(s => [
    s.rank ?? '-',
    s.student_name ?? 'Anonymous',
    s.roll_number ?? '-',
    s.username,
    s.score ?? '-',
    maxScore.value,
    s.percentage ? Number(s.percentage).toFixed(1) + '%' : '-',
    formatDuration(s.time_taken_seconds),
    s.status
  ])
  const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sessionMeta.value?.session_name ?? 'results'}_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// UI & Modal helpers
const isUrl = (str) => {
  if (!str) return false
  return /^https?:\/\//i.test(str.trim())
}
const getCardClass = (q) => {
  if (q.is_correct) return 'bg-green-50/60 border-green-200/70'
  if (q.selected_answer) return 'bg-red-50/60 border-red-200/70'
  return 'bg-gray-50/60 border-gray-200/70'
}
const getQNumberClass = (q) => {
  if (q.is_correct) return 'bg-green-500 text-white'
  if (q.selected_answer) return 'bg-red-500 text-white'
  return 'bg-gray-300 text-white'
}
const getStatusBadgeClass = (q) => {
  if (q.is_correct) return 'bg-green-100 text-green-700'
  if (q.selected_answer) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-500'
}
const getQuestionStatusText = (q) => {
  if (q.is_correct) return 'Correct'
  if (q.selected_answer) return 'Wrong'
  return 'Skipped'
}
const getAnswerTextColor = (q) => {
  if (!q.selected_answer) return 'text-gray-400'
  return q.is_correct ? 'text-green-600' : 'text-red-600'
}
const getQuestionModalBannerClass = (q) => {
  if (!q.selected_answer) return 'bg-gray-50 border-gray-200 text-gray-500'
  if (q.is_correct) return 'bg-green-50 border-green-200 text-green-700'
  return 'bg-red-50 border-red-200 text-red-700'
}
const getQuestionModalStatusText = (q) => {
  if (!q.selected_answer) return 'Not Attempted'
  if (q.is_correct) return 'Correct'
  return 'Incorrect'
}
const getQuestionModalStatusSubtitle = (q) => {
  if (!q.selected_answer) return 'Student skipped this question.'
  if (q.is_correct) return `Student answered: ${String(q.selected_answer).toUpperCase()}`
  return `Student answered: ${String(q.selected_answer).toUpperCase()}  ·  Correct: ${String(q.correct_answer || '?').toUpperCase()}`
}
const getQuestionModalOptions = (q) => {
  return ['choice1', 'choice2', 'choice3', 'choice4'].map((col, i) => {
    const rawVal = q[col]
    let text = ''
    if (rawVal) {
      try {
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal
        text = parsed?.text || parsed || ''
      } catch {
        text = String(rawVal)
      }
    }
    return {
      id: ['a', 'b', 'c', 'd'][i],
      text
    }
  })
}
const getModalOptClass = (q, optId) => {
  if (optId === q.correct_answer) return 'border-green-400 bg-green-50/50 shadow-sm ring-1 ring-green-400'
  if (optId === q.selected_answer && !q.is_correct) return 'border-red-400 bg-red-50/50 shadow-sm ring-1 ring-red-400'
  return 'border-gray-200 hover:bg-gray-50'
}
const getModalOptBadgeClass = (q, optId) => {
  if (optId === q.correct_answer) return 'bg-green-500 text-white'
  if (optId === q.selected_answer && !q.is_correct) return 'bg-red-500 text-white'
  return 'bg-gray-200 text-gray-600'
}

const formatDuration = (totalSeconds) => {
  if (totalSeconds == null) return '-'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
</script>
