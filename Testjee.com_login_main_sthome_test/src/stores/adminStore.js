import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAdminStore = defineStore('admin', () => {
    // State: Will hold { admin_id, institute_name, username, max_tests, max_students, tests_created, students_created }
    const adminProfile = ref(null)
    const isAuthenticated = ref(false)

    // Actions
    const login = async (username, password) => {
        try {
            // Call secure database function
            const { data, error } = await supabase.rpc('admin_login', {
                input_username: username,
                input_password: password
            })

            if (error) {
                console.error('Admin login RPC error:', error)
                throw error
            }

            // If data is empty array or null, invalid credentials
            if (!data || data.length === 0) {
                throw new Error('Invalid username or password')
            }

            const profile = data[0]
            const token = profile.session_token

            if (!token) {
                throw new Error('Invalid username or password')
            }

            // SECURITY RULE: Store ONLY the 64-character token in localStorage
            localStorage.setItem('adminToken', token)

            // Keep admin profile strictly in memory
            adminProfile.value = profile
            isAuthenticated.value = true

            return { success: true }
        } catch (error) {
            console.error('Login failed:', error)
            return { success: false, error: error.message || 'An error occurred during login' }
        }
    }

    const loadSession = async () => {
        try {
            const token = localStorage.getItem('adminToken')
            if (!token) {
                return // No token, no session
            }

            // Call secure database function to re-validate session
            const { data, error } = await supabase.rpc('verify_admin_session', {
                input_token: token
            })

            // If data is empty or error, token is invalid/expired
            if (error || !data || data.length === 0) {
                logout()
                return
            }

            // Valid session
            adminProfile.value = data[0]
            isAuthenticated.value = true
        } catch (error) {
            console.error('Session validation error:', error)
            logout()
        }
    }

    const logout = () => {
        adminProfile.value = null
        isAuthenticated.value = false
        localStorage.removeItem('adminToken')
    }

    // Security fix: RPCs that mutate or read admin-scoped data must verify identity from
    // this token server-side (via verify_admin_session), not trust a client-supplied
    // admin_id integer — see harden-admin-rpc-security.sql for why.
    const getToken = () => localStorage.getItem('adminToken')

    return {
        adminProfile,
        isAuthenticated,
        login,
        loadSession,
        logout,
        getToken
    }
})
