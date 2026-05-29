<template>
  <div class="about-page">
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
            <router-link to="/about" class="nav-link nav-link-active">About</router-link>
            <router-link to="/contact" class="nav-link">Contact</router-link>
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
          <router-link to="/about" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-blue-600 font-medium bg-blue-50">About</router-link>
          <router-link to="/contact" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50">Contact</router-link>
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
          About Us
        </span>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Empowering Students to 
          <span class="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Ace Their Exams</span>
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          TESTJEE is a product of <a href="https://www.gyanedge.co/" target="_blank" class="text-blue-600 hover:underline font-semibold">Gyan Edge Education</a>, 
          dedicated to providing NTA-style mock tests that replicate the real exam experience.
        </p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span class="section-badge">Our Mission</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-6">
              Bridging the Gap Between Practice and Success
            </h2>
            <p class="text-gray-600 text-lg leading-relaxed mb-6">
              We understand that competitive exams like JEE, NEET, and KCET require more than just knowledge—they demand 
              familiarity with the exam environment. TESTJEE provides an authentic testing experience that builds confidence 
              and sharpens your skills.
            </p>
            <div class="flex flex-wrap gap-4">
              <div class="stat-pill">
                <span class="stat-number">10K+</span>
                <span class="stat-text">Students</span>
              </div>
              <div class="stat-pill">
                <span class="stat-number">50K+</span>
                <span class="stat-text">Tests Taken</span>
              </div>
              <div class="stat-pill">
                <span class="stat-number">95%</span>
                <span class="stat-text">Success Rate</span>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="mission-card">
              <div class="mission-icon">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
              <p class="text-gray-600">To become India's most trusted platform for competitive exam preparation, making quality education accessible to all.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Founder Section -->
    <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="section-badge section-badge-orange">Leadership</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">Our Founder</h2>
        </div>
        
        <div class="max-w-3xl mx-auto">
          <div class="founder-card">
            <div class="founder-image-container">
              <img :src="founderImage" alt="Purnendu Mishra" class="founder-image">
            </div>
            <div class="founder-info">
              <div class="founder-badge">Founder & CEO</div>
              <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">Purnendu Mishra</h3>
              <p class="text-gray-600 mt-4 text-lg leading-relaxed">
                A visionary leader with a passion for education, Purnendu founded TESTJEE with the mission to make quality exam preparation accessible to every student in India. Under his leadership, TESTJEE has grown to serve thousands of students across the country.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Team Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="section-badge section-badge-blue">Technology</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">Tech Team</h2>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            The brilliant minds building the technology behind TESTJEE.
          </p>
        </div>
        
        <div class="tech-team-grid">
          <!-- Tech Lead - Clickable Card -->
          <a href="https://vigneshbs.xyz" target="_blank" class="team-card team-card-clickable">
            <div class="team-image-container">
              <img :src="vigneshImage" alt="Vignesh B S" class="team-image">
              <div class="team-badge team-badge-blue">Tech Lead</div>
            </div>
            <div class="team-info">
              <h3 class="team-name">Vignesh B S</h3>
              <p class="team-role">Tech Lead</p>
              <p class="team-bio">Leading the entire tech stack - from cloud infrastructure to frontend and backend development. Managing all technical aspects of TESTJEE.</p>
              <span class="team-link-indicator">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Visit Portfolio
              </span>
            </div>
          </a>
          
          <!-- Developer - Chinmay -->
          <div class="team-card">
            <div class="team-image-container">
              <img :src="chinmayImage" alt="Chinmay Panghri" class="team-image">
              <div class="team-badge team-badge-cyan">Cloud</div>
            </div>
            <div class="team-info">
              <h3 class="team-name">Chinmay Panghri</h3>
              <p class="team-role">Cloud Engineer</p>
              <p class="team-bio">Managing cloud infrastructure and ensuring seamless deployment of TESTJEE services.</p>
            </div>
          </div>
          
          <!-- Developer - Karthik -->
          <div class="team-card">
            <div class="team-image-container">
              <img :src="karthikImage" alt="Karthik B V" class="team-image">
              <div class="team-badge team-badge-purple">Developer</div>
            </div>
            <div class="team-info">
              <h3 class="team-name">Karthik B V</h3>
              <p class="team-role">Frontend Developer</p>
              <p class="team-bio">Crafting beautiful and intuitive user interfaces that enhance the learning experience.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Parent Company Section -->
    <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="parent-company-card">
          <span class="text-sm text-gray-500 font-medium">A Product of</span>
          <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-4">Gyan Edge Education</h3>
          <p class="text-gray-600 mb-6">
            Gyan Edge is committed to revolutionizing education in India through innovative technology and quality content.
          </p>
          <a href="https://www.gyanedge.co/" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Visit Gyan Edge
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-bg">
        <div class="cta-gradient"></div>
      </div>
      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
        <p class="text-blue-100 text-lg mb-8">Join thousands of students who trust TESTJEE for their exam preparation.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/login" class="cta-btn-white">
            Get Started for Free
          </router-link>
          <router-link to="/contact" class="cta-btn-outline">
            Contact Us
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="footer-content">
          <router-link to="/login" class="flex items-center gap-3">
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
import founderImage from '../assets/founder-mishra.jpg'
import vigneshImage from '../assets/developer-vignesh.png'
import chinmayImage from '../assets/chinmay.jpg'
import karthikImage from '../assets/karthik.png'

const mobileMenuOpen = ref(false)
</script>

<style scoped>
/* Base Styles */
.about-page {
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

/* Section Badge */
.section-badge {
  @apply inline-block px-4 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 
         rounded-full text-sm font-semibold;
}

.section-badge-blue {
  @apply bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700;
}

.section-badge-orange {
  @apply bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700;
}

/* Stats */
.stat-pill {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100;
}

.stat-number {
  @apply text-lg font-bold text-blue-600;
}

.stat-text {
  @apply text-sm text-gray-600;
}

/* Mission Card */
.mission-card {
  @apply bg-white rounded-2xl p-8 shadow-xl border border-gray-100;
}

.mission-icon {
  @apply w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center mb-4;
}

/* Founder Card */
.founder-card {
  @apply bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 
         flex flex-col md:flex-row items-center;
}

.founder-image-container {
  @apply w-full md:w-80 h-56 sm:h-64 md:h-80 flex-shrink-0;
}

.founder-image {
  @apply w-full h-full object-cover;
}

.founder-info {
  @apply p-8 md:p-10;
}

.founder-badge {
  @apply inline-block px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white 
         rounded-full text-sm font-bold;
}

/* Tech Team Grid */
.tech-team-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto;
}

.team-card {
  @apply bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 
         transition-all duration-300 hover:shadow-xl hover:-translate-y-2;
}

.team-card-clickable {
  @apply cursor-pointer no-underline block;
}

.team-card-clickable:hover {
  @apply ring-2 ring-blue-500/30;
}

.team-image-container {
  @apply relative h-56 bg-gradient-to-br from-gray-100 to-gray-50;
}

.team-image {
  @apply w-full h-full object-cover;
}

.team-image-placeholder {
  @apply w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100;
}

.team-image-placeholder span {
  @apply text-5xl font-bold text-blue-600/40;
}

.team-badge {
  @apply absolute top-4 right-4 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg;
}

.team-badge-blue {
  @apply bg-blue-500;
}

.team-badge-green {
  @apply bg-green-500;
}

.team-badge-purple {
  @apply bg-purple-500;
}

.team-badge-cyan {
  @apply bg-cyan-500;
}

.team-info {
  @apply p-6;
}

.team-name {
  @apply text-xl font-bold text-gray-900;
}

.team-role {
  @apply text-sm text-blue-600 font-semibold mt-1 mb-3;
}

.team-bio {
  @apply text-sm text-gray-600 leading-relaxed;
}

.team-link-indicator {
  @apply inline-flex items-center gap-2 mt-4 text-sm text-blue-600 font-medium;
}

/* Parent Company */
.parent-company-card {
  @apply bg-white rounded-3xl p-10 md:p-12 border border-gray-100 shadow-xl;
}

/* CTA Section */
.cta-section {
  @apply relative py-20 overflow-hidden;
}

.cta-bg {
  @apply absolute inset-0;
}

.cta-gradient {
  @apply absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500;
}

.cta-btn-white {
  @apply px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg 
         transition-all duration-300 hover:shadow-xl hover:scale-105;
}

.cta-btn-outline {
  @apply px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl 
         transition-all duration-300 hover:bg-white/10;
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
