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

  async function fetchOrCreateStudent() {
    if (!user.value) return

    try {
      const supabaseUserId = user.value.id
      const userEmail = user.value.email

      console.log('Fetching student for user:', supabaseUserId)
      console.log('User metadata:', user.value.user_metadata)
      console.log('localStorage name:', localStorage.getItem('pendingStudentName'))

      // First, try to find by supabase_user_id
      let { data: existing, error: fetchError } = await supabase
        .from('students')
        .select('student_id, student_name, email_id, supabase_user_id')
        .eq('supabase_user_id', supabaseUserId)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching student by supabase_user_id:', fetchError)
      }

      // If not found by supabase_user_id, try by email (for existing records without supabase_user_id)
      if (!existing) {
        const { data: existingByEmail } = await supabase
          .from('students')
          .select('student_id, student_name, email_id, supabase_user_id')
          .eq('email_id', userEmail)
          .maybeSingle()

        if (existingByEmail) {
          console.log('Found existing student by email (needs supabase_user_id update):', existingByEmail)
          
          // Get the name from metadata or localStorage
          const userName = user.value.user_metadata?.name || 
                           localStorage.getItem('pendingStudentName') || 
                           existingByEmail.student_name

          // Update the existing record with supabase_user_id and potentially new name
          const { data: updated, error: updateError } = await supabase
            .from('students')
            .update({
              supabase_user_id: supabaseUserId,
              student_name: userName,
              modification_date: new Date().toISOString()
            })
            .eq('student_id', existingByEmail.student_id)
            .select()
            .single()

          if (updateError) {
            console.error('Error updating student:', updateError)
          } else {
            console.log('Updated existing student:', updated)
            studentProfile.value = updated
            localStorage.removeItem('pendingStudentName')
            return
          }
        }
      }

      if (existing) {
        console.log('Found existing student:', existing)
        studentProfile.value = existing
        return
      }

      // Student doesn't exist at all, create new record
      const userName = user.value.user_metadata?.name || 
                       localStorage.getItem('pendingStudentName') || 
                       'Student'

      console.log('Creating new student with name:', userName)

      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          supabase_user_id: supabaseUserId,
          student_name: userName,
          email_id: userEmail
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting student:', insertError)
        throw insertError
      }

      console.log('Created new student:', newStudent)
      studentProfile.value = newStudent
      
      // Clear localStorage after successful creation
      localStorage.removeItem('pendingStudentName')
    } catch (error) {
      console.error('Failed to fetch/create student:', error)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    studentProfile.value = null
  }

  return { 
    user, 
    isAuthenticated, 
    loading, 
    studentProfile,
    studentName,
    studentId,
    loadSession, 
    fetchOrCreateStudent,
    logout 
  }
})
