import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const studentProfile = ref(null) // { student_id, student_name, email_id, supabase_user_id }

  const isAuthenticated = computed(() => !!user.value)
  const studentName = computed(() => studentProfile.value?.student_name || 'Student')
  const studentId = computed(() => studentProfile.value?.student_id || null)

  async function loadSession() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    loading.value = false
  }

  // NEW: Sign Up with Password
  async function signUpWithPassword(email, password, name, mobile, numberOfTests = 1) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: name,
            mobile: mobile,
            tests: numberOfTests
          }
        }
      })

      if (error) throw error

      // Store in localStorage as backup
      localStorage.setItem('pendingStudentName', name)
      if (mobile) localStorage.setItem('pendingMobileNumber', mobile)
      localStorage.setItem('pendingNumberOfTests', numberOfTests.toString())

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // NEW: Sign In with Password
  async function signInWithPassword(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      user.value = data.user

      // Fetch or create student profile
      await fetchOrCreateStudent()

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // NEW: Reset Password (send email)
  async function resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // NEW: Update Password (after reset)
  async function updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // UPDATED: fetchOrCreateStudent with mobile number support
  async function fetchOrCreateStudent() {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) throw new Error('No user found')

      // Update global user ref
      user.value = currentUser

      const supabaseUserId = currentUser.id
      const userEmail = currentUser.email

      console.log('Fetching student for user:', supabaseUserId)
      console.log('User metadata:', currentUser.user_metadata)

      // Try to find by supabase_user_id
      let { data: student, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('supabase_user_id', supabaseUserId)
        .maybeSingle()

      // Fallback: Try to find by email
      if (!student) {
        const { data: studentByEmail } = await supabase
          .from('students')
          .select('*')
          .eq('email_id', userEmail)
          .maybeSingle()

        if (studentByEmail) {
          // Update existing student with new supabase_user_id
          const { data: updated } = await supabase
            .from('students')
            .update({
              supabase_user_id: supabaseUserId,
              student_name: currentUser.user_metadata.name || studentByEmail.student_name,
              modification_date: new Date().toISOString()
            })
            .eq('student_id', studentByEmail.student_id)
            .select()
            .single()

          student = updated
        }
      }

      // If still not found, create new student
      if (!student) {
        const name = currentUser.user_metadata.name || localStorage.getItem('pendingStudentName') || 'Student'
        const mobile = currentUser.user_metadata.mobile || localStorage.getItem('pendingMobileNumber') || null
        const tests = currentUser.user_metadata.tests || parseInt(localStorage.getItem('pendingNumberOfTests') || '1')

        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert({
            student_name: name,
            email_id: userEmail,
            mobile_number: mobile,
            number_of_tests: tests,
            supabase_user_id: supabaseUserId,
            creation_date: new Date().toISOString(),
            modification_date: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating student record:', insertError)
          throw new Error(`Failed to create student profile: ${insertError.message}`)
        }

        student = newStudent

        // Clear localStorage
        localStorage.removeItem('pendingStudentName')
        localStorage.removeItem('pendingMobileNumber')
        localStorage.removeItem('pendingNumberOfTests')
      }

      studentProfile.value = student
      console.log('Student profile set:', student)
      return student

    } catch (error) {
      console.error('Error in fetchOrCreateStudent:', error)
      throw error
    }
  }

  // Update student profile fields
  async function updateStudentProfile(updates) {
    try {
      if (!studentProfile.value?.student_id) throw new Error('No student profile loaded')

      const { data, error } = await supabase
        .from('students')
        .update({
          ...updates,
          modification_date: new Date().toISOString()
        })
        .eq('student_id', studentProfile.value.student_id)
        .select()
        .single()

      if (error) throw error

      studentProfile.value = data
      return { success: true }
    } catch (error) {
      console.error('Error updating student profile:', error)
      return { success: false, error: error.message }
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Supabase sign out error (clearing local session forcefully):', e)
    } finally {
      // Fallback: Manually remove standard Supabase auth tokens from localStorage to be absolutely sure
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
            localStorage.removeItem(key);
          }
        }
      } catch (err) { } // Ignore browser localStorage access errors

      user.value = null
      studentProfile.value = null
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    studentProfile,
    studentName,
    studentId,
    loadSession,
    signUpWithPassword,
    signInWithPassword,
    resetPassword,
    updatePassword,
    updateStudentProfile,
    fetchOrCreateStudent,
    logout
  }
})
