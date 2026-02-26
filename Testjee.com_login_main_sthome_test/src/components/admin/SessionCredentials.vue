<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="router.push('/admin/sessions')" class="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Session Credentials</h1>
      </div>
      
      <button 
        @click="printCredentials" 
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Print / Save PDF
      </button>
    </div>

    <!-- Printable Area Start -->
    <div id="credentials-printable-area" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
      
      <!-- Top Overview Box -->
      <div class="p-8 bg-[#F4F7FB] border-b-2 border-blue-500 print:bg-white print:border-black print:pb-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide print:text-black">LIVE EXAM CREDENTIALS</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <span class="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Session Name</span>
             <strong class="text-lg text-gray-900">{{ meta.sessionName }}</strong>
          </div>
          <div>
             <span class="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Session Code <span class="text-xs font-normal lowercase">(For students)</span></span>
             <strong class="text-2xl font-mono text-blue-600 tracking-widest bg-white px-3 py-1 rounded inline-block border border-blue-100 shadow-sm">{{ meta.sessionCode }}</strong>
          </div>
          <div class="md:col-span-2 mt-2">
            <span class="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Instructions For Students</span>
            <div class="bg-white p-4 rounded-lg border border-gray-200 text-gray-700 text-sm">
              <ol class="list-decimal pl-5 space-y-1">
                <li>Visit <strong class="text-blue-600">testjee.com/live-exam/{{ meta.sessionCode }}</strong></li>
                <li>Enter the session code, your unique Username, and Password assigned below.</li>
                <li>Write your real Full Name and Roll Code accurately if prompted.</li>
                <li>Wait in the lobby for the instructor to begin the exam dynamically.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Credentials Grid -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <!-- Loop generation of cards -->
          <div 
            v-for="(cred, index) in meta.credentials" 
            :key="index"
            class="flex items-center gap-4 p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all print:border-solid print:border-gray-400"
          >
            <div class="bg-blue-100 text-blue-800 font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              {{ index + 1 }}
            </div>
            <div class="overflow-hidden">
               <div class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Username</div>
               <div class="font-mono font-bold text-gray-900 text-base truncate">{{ cred.username }}</div>
               
               <div class="text-xs text-gray-500 uppercase tracking-wide mt-2 mb-0.5">Password</div>
               <div class="font-mono font-bold text-gray-900 text-base flex items-center gap-2">
                 {{ cred.password }}
               </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
    <!-- Printable Area End -->

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const meta = ref({
  sessionCode: '',
  sessionName: '',
  credentials: []
})

onMounted(() => {
  const savedData = sessionStorage.getItem('newSessionCredentials')
  if (savedData) {
    meta.value = JSON.parse(savedData)
  } else {
    // Missing data fallback
    router.push('/admin/home')
  }
})

const printCredentials = () => {
  window.print()
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #credentials-printable-area, #credentials-printable-area * {
    visibility: visible;
  }
  #credentials-printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none !important;
    border: none !important;
  }
  /* Remove Tailwind bg overrides that break pure print layouts */
  .bg-gray-50 {
    background-color: transparent !important;
  }
}
</style>
