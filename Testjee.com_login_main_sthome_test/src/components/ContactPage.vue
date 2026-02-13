<template>
  <div class="contact-page">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <router-link to="/login" class="flex items-center gap-3 group cursor-pointer">
            <div class="relative">
              <img :src="logo" alt="TESTJEE Logo" class="w-10 h-10 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 object-contain">
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">TESTJEE</span>
          </router-link>
          
          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <router-link to="/" class="nav-link">Home</router-link>
            <router-link to="/about" class="nav-link">About</router-link>
            <router-link to="/contact" class="nav-link nav-link-active">Contact</router-link>
          </div>
          
          <!-- Desktop CTA -->
          <div class="hidden sm:flex items-center gap-3">
            <router-link to="/login" class="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-all duration-300">
              Login
            </router-link>
            <router-link to="/login" class="cta-button-primary">
              <span>Get Started</span>
            </router-link>
          </div>
          
          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg v-if="!mobileMenuOpen" class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl">
        <div class="px-4 py-4 space-y-3">
          <router-link to="/" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50">Home</router-link>
          <router-link to="/about" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50">About</router-link>
          <router-link to="/contact" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-blue-600 font-medium bg-blue-50">Contact</router-link>
          <div class="pt-3 border-t border-gray-100">
            <router-link to="/login" class="block py-3 px-4 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl">
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="mesh-gradient"></div>
        <div class="floating-orb orb-1"></div>
        <div class="floating-orb orb-2"></div>
      </div>
      
      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
          Get in Touch
        </span>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          We'd Love to 
          <span class="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Hear from You</span>
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Have questions about TESTJEE? Want to partner with us? We're here to help!
        </p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Contact Info -->
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <p class="text-gray-600 mb-8">
              Reach out to us through any of the channels below. We typically respond within 24 hours.
            </p>
            
            <div class="space-y-6">
              <!-- Email -->
              <div class="contact-info-card">
                <div class="contact-icon bg-blue-100">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:testjee.india@gmail.com" class="text-blue-600 hover:underline">testjee.india@gmail.com</a>
                </div>
              </div>
              
              <!-- Website -->
              <div class="contact-info-card">
                <div class="contact-icon bg-green-100">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Website</h3>
                  <span class="text-gray-600">testjee.com (Coming Soon)</span>
                </div>
              </div>
              
              <!-- Parent Company -->
              <div class="contact-info-card">
                <div class="contact-icon bg-purple-100">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Parent Company</h3>
                  <a href="https://www.gyanedge.co/" target="_blank" class="text-blue-600 hover:underline">Gyan Edge Education</a>
                </div>
              </div>
            </div>
            
            <!-- Social Links -->
            <div class="mt-10">
              <h3 class="font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div class="flex gap-4">
                <a href="#" class="social-link">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" class="social-link social-link-youtube">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <!-- Contact Form -->
          <div class="contact-form-container">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            <!-- Success Message -->
            <div v-if="formSubmitted" class="success-message">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="font-semibold text-gray-900">Message Sent!</h3>
                <p class="text-gray-600 text-sm">We'll get back to you within 24 hours.</p>
              </div>
            </div>
            
            <form 
              v-else
              action="https://formsubmit.co/testjee.india@gmail.com" 
              method="POST"
              @submit="handleSubmit"
              class="space-y-5"
            >
              <!-- FormSubmit Configuration -->
              <input type="hidden" name="_subject" value="New Contact from TESTJEE Website">
              <input type="hidden" name="_captcha" value="false">
              <input type="hidden" name="_template" value="table">
              <input type="text" name="_honey" style="display:none">
              
              <div class="grid sm:grid-cols-2 gap-5">
                <div>
                  <label for="name" class="form-label">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    class="form-input"
                    placeholder="John Doe"
                  >
                </div>
                <div>
                  <label for="email" class="form-label">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    class="form-input"
                    placeholder="john@example.com"
                  >
                </div>
              </div>
              
              <div>
                <label for="phone" class="form-label">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  class="form-input"
                  placeholder="+91 98765 43210"
                >
              </div>
              
              <div>
                <label for="subject" class="form-label">Subject</label>
                <select id="subject" name="subject" required class="form-input">
                  <option value="">Select a topic</option>
                  <option value="Student Inquiry">Student - Want to Buy/Subscribe</option>
                  <option value="Teacher Inquiry">Teacher/Coaching - Bulk Purchase</option>
                  <option value="Institution Inquiry">Institution/School - Partnership</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label for="message" class="form-label">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5" 
                  required
                  class="form-input"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <button type="submit" class="submit-button">
                <span>Send Message</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="footer-content">
          <router-link to="/" class="flex items-center gap-3">
            <img :src="logo" alt="TESTJEE Logo" class="w-10 h-10 rounded-xl object-contain">
            <div>
              <div class="text-xl font-bold text-white">TESTJEE</div>
              <div class="text-sm text-gray-400">by Gyan Edge</div>
            </div>
          </router-link>
          <div class="footer-links">
            <router-link to="/" class="footer-link">Home</router-link>
            <router-link to="/about" class="footer-link">About</router-link>
            <router-link to="/contact" class="footer-link">Contact</router-link>
          </div>
          <p class="text-gray-400 text-sm">© {{ new Date().getFullYear() }} TESTJEE by Gyan Edge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logo from '../assets/logo_test_jee.png'

const mobileMenuOpen = ref(false)
const formSubmitted = ref(false)

const handleSubmit = () => {
  // Show success message after form submission
  setTimeout(() => {
    formSubmitted.value = true
  }, 100)
}
</script>

<style scoped>
/* Base Styles */
.contact-page {
  @apply min-h-screen;
}

/* Navigation */
.nav-link {
  @apply relative text-gray-600 font-medium transition-all duration-300 hover:text-blue-600;
}

.nav-link-active {
  @apply text-blue-600;
}

.cta-button-primary {
  @apply px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl 
         transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105;
}

/* Hero Section */
.hero-section {
  @apply relative pt-32 pb-20 overflow-hidden;
}

.hero-bg {
  @apply absolute inset-0;
}

.mesh-gradient {
  @apply absolute inset-0;
  background: 
    radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    linear-gradient(to bottom right, #f8fafc, #eff6ff, #f0f9ff);
}

.floating-orb {
  @apply absolute rounded-full blur-3xl;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  @apply w-[400px] h-[400px] bg-blue-200/30 top-0 left-[-10%];
}

.orb-2 {
  @apply w-[300px] h-[300px] bg-cyan-200/30 bottom-0 right-[-5%];
  animation-delay: -2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Contact Info Cards */
.contact-info-card {
  @apply flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md;
}

.contact-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0;
}

/* Social Links */
.social-link {
  @apply w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 
         transition-all duration-300 hover:bg-blue-100 hover:text-blue-600;
}

.social-link-youtube:hover {
  @apply bg-red-100 text-red-600;
}

/* Contact Form */
.contact-form-container {
  @apply bg-white rounded-2xl p-8 shadow-xl border border-gray-100;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-input {
  @apply w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400
         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300;
}

.submit-button {
  @apply w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl
         shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2
         transition-all duration-300 hover:shadow-xl hover:scale-[1.02];
}

.success-message {
  @apply flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-100;
}

/* Footer */
.footer {
  @apply bg-gray-900 py-8;
}

.footer-content {
  @apply flex flex-col md:flex-row items-center justify-between gap-6;
}

.footer-links {
  @apply flex items-center gap-6;
}

.footer-link {
  @apply text-gray-400 hover:text-white transition-colors text-sm;
}
</style>
