<template>
  <div class="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
      <!-- TESTJEE Branding -->
      <div class="flex items-center justify-center gap-2 mb-6">
        <img :src="logo" alt="TESTJEE" class="w-8 h-8 object-contain" />
        <span class="text-lg font-bold text-blue-600">TESTJEE Admin</span>
      </div>

      <h2 class="text-2xl font-bold mb-4 text-gray-800">Student Approval</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-6">
        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Creating student account...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="py-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2 text-green-700">{{ isRestore ? 'Tests Restored!' : 'Student Approved!' }}</h3>
        <div class="bg-gray-50 rounded-xl p-4 text-left mt-4 space-y-2">
          <p class="text-sm"><span class="font-medium text-gray-700">Name:</span> <span class="text-gray-600">{{ studentName }}</span></p>
          <p class="text-sm"><span class="font-medium text-gray-700">Email:</span> <span class="text-gray-600">{{ studentEmail }}</span></p>
          <p v-if="!isRestore" class="text-sm"><span class="font-medium text-gray-700">Mobile:</span> <span class="text-gray-600">{{ studentMobile || 'Not provided' }}</span></p>
          <p class="text-sm"><span class="font-medium text-gray-700">Tests:</span> <span class="text-gray-600">{{ numberOfTests }}</span></p>
        </div>
        <p class="mt-4 text-gray-600 text-sm">{{ isRestore ? `${numberOfTests} tests have been restored for this student. You can close this tab.` : 'The student can now log in with their credentials. You can close this tab.' }}</p>
      </div>

      <!-- Error State -->
      <div v-else class="py-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2 text-red-700">Approval Failed</h3>
        <p class="text-gray-600">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo_test_jee_original.png'

const route = useRoute()

const loading = ref(true)
const success = ref(false)
const isRestore = ref(false)
const errorMessage = ref('')
const studentName = ref('')
const studentEmail = ref('')
const studentMobile = ref('')
const numberOfTests = ref(1)

onMounted(async () => {
  try {
    const { action, name, email, mobile, tests, pwd, sid } = route.query

    studentName.value = name || 'Student'
    studentEmail.value = email || ''
    studentMobile.value = mobile || ''
    numberOfTests.value = parseInt(tests) || 1

    // ===== RESTORE TESTS FLOW =====
    if (action === 'restore') {
      if (!email && !sid) {
        throw new Error("Missing required parameters for test restoration.")
      }

      console.log('[TESTJEE Admin] Restoring tests for:', email, '| Count:', numberOfTests.value)

      // Update the student's number_of_tests
      const updateQuery = supabase
        .from('students')
        .update({
          number_of_tests: numberOfTests.value,
          modification_date: new Date().toISOString()
        })

      // Match by student_id if available, otherwise by email
      if (sid) {
        await updateQuery.eq('student_id', parseInt(sid))
      } else {
        await updateQuery.eq('email_id', email)
      }

      console.log('[TESTJEE Admin] Tests restored successfully')
      isRestore.value = true
      success.value = true
      loading.value = false
      return
    }

    // ===== NEW STUDENT APPROVAL FLOW =====
    if (!email || !pwd) {
      throw new Error("Missing required approval parameters. The approval link might be invalid.")
    }

    const decodedPassword = atob(pwd)

    console.log('[TESTJEE Admin] Approving student:', email)

    // Step 1: Create or fetch the auth user in Supabase
    let finalAuthUserId = null;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: decodedPassword,
      options: {
        data: {
          name: studentName.value,
          mobile: mobile,
          tests: numberOfTests.value
        }
      }
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered') || authError.message.toLowerCase().includes('already taken')) {
        // This is EXPECTED because the student already signed up to verify email.
        console.log('[TESTJEE Admin] User exists in Auth. Identifying user...');
        
        // We need their ID to update the students table.
        // Easiest way as an admin is to sign in temporarily or just update the table by email.
        // Since we are updating the students table by email anyway if duplicate, we can proceed.
      } else {
         throw authError
      }
    } else {
        if(authData?.user) finalAuthUserId = authData.user.id;
    }

    console.log('[TESTJEE Admin] Auth user processed.');

    // Step 2: Update or create the student record in the students table
    if (true) { // Proceed regardless of auth signup error
      const insertPayload = {
          student_name: studentName.value,
          email_id: email,
          mobile_number: mobile || null,
          number_of_tests: numberOfTests.value,
          is_approved: true,
          modification_date: new Date().toISOString()
      };
      
      if(finalAuthUserId) insertPayload.supabase_user_id = finalAuthUserId;

      const { error: insertError } = await supabase
        .from('students')
        .insert({
          ...insertPayload,
          creation_date: new Date().toISOString()
        })

      if (insertError) {
        if (insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
          console.log('[TESTJEE Admin] Student record already exists, updating...')
          
          const updatePayload = {
              ...insertPayload,
              modification_date: new Date().toISOString()
          }

          await supabase
            .from('students')
            .update(updatePayload)
            .eq('email_id', email)
        } else {
          console.error('[TESTJEE Admin] Insert error:', insertError)
          throw new Error(`Failed to create student record: ${insertError.message}`)
        }
      }

      console.log('[TESTJEE Admin] Student record created/updated successfully')
    }

    // Step 3: Sign out so admin's browser isn't logged in as the student
    await supabase.auth.signOut()

    success.value = true
  } catch (err) {
    console.error('[TESTJEE Admin] Approval error:', err)
    errorMessage.value = err.message || "An unexpected error occurred."
  } finally {
    loading.value = false
  }
})
</script>
