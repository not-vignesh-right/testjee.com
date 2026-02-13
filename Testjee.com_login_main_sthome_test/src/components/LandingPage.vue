<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3 group cursor-pointer">
            <div class="relative">
              <img src="/logo.png" alt="TESTJEE Logo" class="w-10 h-10 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">TESTJEE</span>
          </div>
          
          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="nav-link">Features</a>
            <a href="#exams" class="nav-link">Exams</a>
            <a href="#how-it-works" class="nav-link">How It Works</a>
            <router-link to="/about" class="nav-link">About</router-link>
            <router-link to="/contact" class="nav-link">Contact</router-link>
          </div>
          
          <!-- Desktop CTA -->
          <div class="hidden sm:flex items-center gap-3">
            <router-link to="/login" class="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-105">
              Login
            </router-link>
            <router-link to="/login" class="cta-button-primary">
              <span>Get Started</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
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
      
      <!-- Mobile Menu Dropdown -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl">
        <div class="px-4 py-4 space-y-3">
          <a href="#features" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors">Features</a>
          <a href="#exams" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors">Exams</a>
          <a href="#how-it-works" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors">How It Works</a>
          <router-link to="/about" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors">About</router-link>
          <router-link to="/contact" @click="mobileMenuOpen = false" class="block py-2 px-4 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors">Contact</router-link>
          <div class="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <router-link to="/login" class="py-3 px-4 text-center text-blue-600 font-semibold rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors">
              Login
            </router-link>
            <router-link to="/login" class="py-3 px-4 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg">
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <!-- Animated Mesh Background -->
      <div class="hero-bg">
        <div class="mesh-gradient"></div>
        <div class="floating-orb orb-1"></div>
        <div class="floating-orb orb-2"></div>
        <div class="floating-orb orb-3"></div>
        <div class="grid-pattern"></div>
      </div>
      
      <!-- Floating Geometric Shapes -->
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      
      <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Trust Badge -->
        <div class="trust-badge animate-float-slow">
          <span class="pulse-dot"></span>
          <span>Trusted by 10,000+ Students</span>
          <div class="badge-shine"></div>
        </div>
        
        <!-- Hero Headline -->
        <h1 class="hero-headline">
          <span class="headline-reveal">Ace Your Entrance Exams with</span>
          <span class="gradient-text headline-reveal" style="animation-delay: 0.2s"> NTA-Style Mock Tests</span>
        </h1>
        
        <p class="hero-description animate-fade-up" style="animation-delay: 0.4s">
          Experience the actual exam environment before the big day. Our platform replicates NTA's interface, 
          question patterns, and timing to perfection — giving you the confidence to excel.
        </p>
        
        <!-- CTA Buttons -->
        <div class="hero-cta animate-fade-up" style="animation-delay: 0.6s">
          <router-link to="/login" class="cta-button-hero group">
            <span class="cta-glow"></span>
            <span class="relative z-10 flex items-center gap-2">
              <span>Start Free Test</span>
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </span>
          </router-link>
          <a href="#how-it-works" class="cta-button-secondary group">
            <svg class="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>See How It Works</span>
          </a>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid animate-fade-up" style="animation-delay: 0.8s">
          <div class="stat-card" v-for="(stat, index) in stats" :key="index">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-shine"></div>
          </div>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <a href="#features" class="scroll-indicator">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span class="scroll-text">Scroll to explore</span>
        <svg class="scroll-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </a>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="section-header">
          <span class="section-badge">Platform Features</span>
          <h2 class="section-title">Everything You Need to Succeed</h2>
          <p class="section-subtitle">Our comprehensive platform provides all the tools you need to prepare effectively and track your progress.</p>
        </div>
        
        <div class="features-grid">
          <!-- Feature 1: NTA-Style Interface -->
          <div class="feature-card" style="--delay: 0s">
            <div class="feature-icon gradient-blue">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="feature-title">NTA-Style Interface</h3>
            <p class="feature-description">Experience the exact same exam interface as the real NTA exams. No surprises on exam day.</p>
            <div class="feature-glow glow-blue"></div>
          </div>
          
          <!-- Feature 2: Detailed Analytics -->
          <div class="feature-card" style="--delay: 0.1s">
            <div class="feature-icon gradient-green">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="feature-title">Detailed Analytics</h3>
            <p class="feature-description">Get comprehensive performance reports with question-wise analysis, time spent, and accuracy metrics.</p>
            <div class="feature-glow glow-green"></div>
          </div>
          
          <!-- Feature 3: Mistake Analysis -->
          <div class="feature-card" style="--delay: 0.2s">
            <div class="feature-icon gradient-purple">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="feature-title">Mistake Analysis</h3>
            <p class="feature-description">Identify your weak areas with detailed mistake tracking. Learn from errors and avoid repeating them.</p>
            <div class="feature-glow glow-purple"></div>
          </div>
          
          <!-- Feature 4: Timed Practice -->
          <div class="feature-card" style="--delay: 0.3s">
            <div class="feature-icon gradient-orange">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="feature-title">Timed Practice</h3>
            <p class="feature-description">Practice under real exam conditions with accurate timers and section-wise time limits.</p>
            <div class="feature-glow glow-orange"></div>
          </div>
          
          <!-- Feature 5: Progress Tracking -->
          <div class="feature-card" style="--delay: 0.4s">
            <div class="feature-icon gradient-cyan">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <h3 class="feature-title">Progress Tracking</h3>
            <p class="feature-description">Monitor your improvement over time with visual progress charts and performance trends.</p>
            <div class="feature-glow glow-cyan"></div>
          </div>
          
          <!-- Feature 6: Smart Insights -->
          <div class="feature-card" style="--delay: 0.5s">
            <div class="feature-icon gradient-pink">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <h3 class="feature-title">Smart Insights</h3>
            <p class="feature-description">Get personalized recommendations based on your performance to optimize your preparation.</p>
            <div class="feature-glow glow-pink"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Exams Section -->
    <section id="exams" class="exams-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="section-header">
          <span class="section-badge section-badge-blue">Exams Covered</span>
          <h2 class="section-title">Prepare for All Major Entrance Exams</h2>
          <p class="section-subtitle">Comprehensive mock tests for India's most competitive entrance examinations.</p>
        </div>
        
        <div class="exams-grid">
          <router-link 
            v-for="(exam, index) in exams" 
            :key="index" 
            to="/login"
            class="exam-card"
            @mousemove="handleTilt($event, index)"
            @mouseleave="resetTilt(index)"
          >
            <div class="exam-card-inner">
              <div class="exam-icon" :class="exam.gradient">
                <span>{{ exam.code }}</span>
              </div>
              <h3 class="exam-title">{{ exam.title }}</h3>
              <p class="exam-description">{{ exam.description }}</p>
              <div class="exam-subjects">
                <span v-for="subject in exam.subjects" :key="subject" class="exam-subject" :class="exam.pillColor">
                  {{ subject }}
                </span>
              </div>
              <button class="exam-cta">Start Test →</button>
              <div class="exam-shine"></div>
            </div>
          </router-link>
        </div>
        
        <!-- Coming Soon -->
        <div class="coming-soon">
          <p class="coming-soon-text">And more coming soon...</p>
          <div class="coming-soon-badges">
            <span v-for="badge in comingSoon" :key="badge" class="coming-soon-badge">{{ badge }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="section-header">
          <span class="section-badge section-badge-green">Simple Process</span>
          <h2 class="section-title">How It Works</h2>
          <p class="section-subtitle">Get started in just a few simple steps and begin your exam preparation journey.</p>
        </div>
        
        <!-- Desktop View: Horizontal Steps -->
        <div class="hidden md:block">
          <div class="steps-container">
            <div class="steps-line">
              <div class="steps-line-progress"></div>
            </div>
            <div class="steps-grid-desktop">
              <div 
                v-for="(step, index) in steps" 
                :key="index" 
                class="step-card-desktop"
                :style="{ '--delay': `${index * 0.15}s` }"
              >
                <div class="step-number" :class="step.gradient">
                  <span>{{ index + 1 }}</span>
                </div>
                <h3 class="step-title">{{ step.title }}</h3>
                <p class="step-description">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mobile View: Timeline Style -->
        <div class="md:hidden">
          <div class="timeline-container">
            <div 
              v-for="(step, index) in steps" 
              :key="index" 
              class="timeline-item"
            >
              <div class="timeline-line-container">
                <div class="timeline-dot" :class="step.gradient">
                  <span>{{ index + 1 }}</span>
                </div>
                <div v-if="index < steps.length - 1" class="timeline-connector" :class="`connector-${index + 1}`"></div>
              </div>
              <div class="timeline-content">
                <h3 class="timeline-title">{{ step.title }}</h3>
                <p class="timeline-description">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-bg">
        <div class="cta-gradient"></div>
        <div class="cta-particles">
          <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></div>
        </div>
        <div class="cta-glow-orb cta-orb-1"></div>
        <div class="cta-glow-orb cta-orb-2"></div>
      </div>
      
      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="cta-headline">Ready to Start Your Preparation?</h2>
        <p class="cta-subheadline">Join thousands of successful students who trusted TESTJEE for their exam preparation. Start for free today!</p>
        
        <div class="cta-buttons">
          <router-link to="/login" class="cta-btn-white group">
            <span>Get Started for Free</span>
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </router-link>
          <router-link to="/login" class="cta-btn-outline">
            Login to Dashboard
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-glow"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <div class="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="TESTJEE Logo" class="w-12 h-12 rounded-xl shadow-lg">
              <div>
                <div class="text-2xl font-bold text-white">TESTJEE</div>
                <div class="text-sm text-gray-500">by Gyan Edge</div>
              </div>
            </div>
            <p class="text-gray-400 mb-6 max-w-md leading-relaxed">
              India's most trusted platform for NTA-style mock tests. Prepare with confidence and ace your entrance exams.
            </p>
            <p class="text-sm italic text-gray-500">"Exam se pehle original"</p>
          </div>
          
          <!-- Quick Links -->
          <div class="footer-links">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="space-y-3">
              <li><a href="#features" class="footer-link">Features</a></li>
              <li><a href="#exams" class="footer-link">Exams</a></li>
              <li><a href="#how-it-works" class="footer-link">How It Works</a></li>
              <li><router-link to="/about" class="footer-link">About Us</router-link></li>
              <li><router-link to="/contact" class="footer-link">Contact</router-link></li>
              <li><router-link to="/login" class="footer-link">Login</router-link></li>
            </ul>
          </div>
          
          <!-- Connect -->
          <div class="footer-connect">
            <h4 class="footer-heading">Connect</h4>
            <ul class="space-y-3">
              <li><a href="https://gyanedge.co" target="_blank" class="footer-link">Gyan Edge Website</a></li>
              <li><a href="mailto:testjee.india@gmail.com" class="footer-link">testjee.india@gmail.com</a></li>
            </ul>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Twitter">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" class="social-link social-link-youtube" aria-label="YouTube">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} TESTJEE by Gyan Edge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Mobile menu state
const mobileMenuOpen = ref(false)

// Stats data
const stats = ref([
  { value: '50K+', label: 'Tests Taken' },
  { value: '95%', label: 'Success Rate' },
  { value: '5+', label: 'Exam Types' },
  { value: '24/7', label: 'Access' }
])

// Features data
const features = ref([
  {
    title: 'NTA-Style Interface',
    description: 'Experience the exact same exam interface as the real NTA exams. No surprises on exam day.',
    gradient: 'gradient-blue',
    glowColor: 'glow-blue',
    icon: 'DocumentIcon'
  },
  {
    title: 'Detailed Analytics',
    description: 'Get comprehensive performance reports with question-wise analysis, time spent, and accuracy metrics.',
    gradient: 'gradient-green',
    glowColor: 'glow-green',
    icon: 'ChartIcon'
  },
  {
    title: 'Mistake Analysis',
    description: 'Identify your weak areas with detailed mistake tracking. Learn from errors and avoid repeating them.',
    gradient: 'gradient-purple',
    glowColor: 'glow-purple',
    icon: 'BulbIcon'
  },
  {
    title: 'Timed Practice',
    description: 'Practice under real exam conditions with accurate timers and section-wise time limits.',
    gradient: 'gradient-orange',
    glowColor: 'glow-orange',
    icon: 'ClockIcon'
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your improvement over time with visual progress charts and performance trends.',
    gradient: 'gradient-cyan',
    glowColor: 'glow-cyan',
    icon: 'TrendIcon'
  },
  {
    title: 'Smart Insights',
    description: 'Get personalized recommendations based on your performance to optimize your preparation.',
    gradient: 'gradient-pink',
    glowColor: 'glow-pink',
    icon: 'SparkleIcon'
  }
])

// Exams data
const exams = ref([
  {
    code: 'JEE',
    title: 'JEE Main & Advanced',
    description: 'Complete preparation for IIT-JEE with topic-wise and full-length tests',
    subjects: ['Physics', 'Chemistry', 'Maths'],
    gradient: 'exam-gradient-blue',
    pillColor: 'pill-blue'
  },
  {
    code: 'NEET',
    title: 'NEET UG',
    description: 'Medical entrance preparation with NTA pattern questions',
    subjects: ['Biology', 'Physics', 'Chemistry'],
    gradient: 'exam-gradient-green',
    pillColor: 'pill-green'
  },
  {
    code: 'KCET',
    title: 'Karnataka CET',
    description: 'State-level engineering & medical entrance preparation',
    subjects: ['PCM', 'PCB'],
    gradient: 'exam-gradient-purple',
    pillColor: 'pill-purple'
  },
  {
    code: 'NDA',
    title: 'NDA Exam',
    description: 'National Defence Academy entrance preparation',
    subjects: ['Maths', 'GAT'],
    gradient: 'exam-gradient-orange',
    pillColor: 'pill-orange'
  }
])

const comingSoon = ref(['BITSAT', 'VITEEE', 'CUET', 'MHT-CET'])

// Steps data
const steps = ref([
  { title: 'Register', description: 'Create your free account with just your email. No credit card required.', gradient: 'step-gradient-1' },
  { title: 'Choose Test', description: 'Select from our library of mock tests tailored to your target exam.', gradient: 'step-gradient-2' },
  { title: 'Take Test', description: 'Experience the real exam environment with our NTA-style interface.', gradient: 'step-gradient-3' },
  { title: 'Improve', description: 'Review detailed analysis, learn from mistakes, and track your progress.', gradient: 'step-gradient-4' }
])

// Card tilt effect
const handleTilt = (e, index) => {
  const card = document.querySelector(`[data-exam-index="${index}"]`) || e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = (y - centerY) / 10
  const rotateY = (centerX - x) / 10
  
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
}

const resetTilt = (index) => {
  const cards = document.querySelectorAll('.exam-card')
  if (cards[index]) {
    cards[index].style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
  }
}

// Particle styles for CTA
const getParticleStyle = (n) => {
  return {
    '--x': `${Math.random() * 100}%`,
    '--y': `${Math.random() * 100}%`,
    '--duration': `${3 + Math.random() * 4}s`,
    '--delay': `${Math.random() * 2}s`,
    '--size': `${2 + Math.random() * 4}px`
  }
}
</script>

<style scoped>
/* ===== BASE STYLES ===== */
.landing-page {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

/* ===== NAVIGATION ===== */
.nav-link {
  @apply relative text-gray-600 font-medium transition-all duration-300;
}

.nav-link::after {
  content: '';
  @apply absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300;
}

.nav-link:hover {
  @apply text-blue-600;
}

.nav-link:hover::after {
  @apply w-full;
}

.cta-button-primary {
  @apply px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl 
         flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25
         hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 hover:-translate-y-0.5;
}

/* ===== HERO SECTION ===== */
.hero-section {
  @apply relative min-h-screen flex items-center justify-center pt-20 sm:pt-16 pb-24 sm:pb-16 overflow-hidden;
}

.hero-bg {
  @apply absolute inset-0;
}

.mesh-gradient {
  @apply absolute inset-0;
  background: 
    radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 60% 60% at 0% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse 60% 60% at 100% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
    linear-gradient(to bottom right, #f8fafc, #eff6ff, #f0f9ff);
  animation: meshMove 20s ease-in-out infinite;
}

@keyframes meshMove {
  0%, 100% { background-position: 0% 0%, 0% 50%, 100% 50%, 0% 0%; }
  50% { background-position: 100% 100%, 100% 50%, 0% 50%, 100% 100%; }
}

.floating-orb {
  @apply absolute rounded-full blur-3xl;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  @apply w-[500px] h-[500px] bg-blue-200/30 top-10 left-[-10%];
  animation-delay: 0s;
}

.orb-2 {
  @apply w-[400px] h-[400px] bg-cyan-200/30 bottom-10 right-[-5%];
  animation-delay: -2s;
}

.orb-3 {
  @apply w-[600px] h-[600px] bg-indigo-100/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(0) translateX(20px); }
  75% { transform: translateY(20px) translateX(10px); }
}

.grid-pattern {
  @apply absolute inset-0 opacity-[0.03];
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* Floating Shapes */
.floating-shapes {
  @apply absolute inset-0 pointer-events-none;
}

.shape {
  @apply absolute rounded-2xl;
  animation: floatShape 15s ease-in-out infinite;
}

.shape-1 {
  @apply w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 top-[15%] left-[10%] rotate-12;
  animation-delay: 0s;
}

.shape-2 {
  @apply w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 top-[25%] right-[15%] -rotate-12;
  animation-delay: -3s;
}

.shape-3 {
  @apply w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 bottom-[30%] left-[20%] rotate-45;
  animation-delay: -6s;
}

.shape-4 {
  @apply w-14 h-14 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 bottom-[20%] right-[25%] -rotate-6;
  animation-delay: -9s;
}

@keyframes floatShape {
  0%, 100% { transform: rotate(var(--rotate, 12deg)) translateY(0); }
  50% { transform: rotate(var(--rotate, 12deg)) translateY(-30px); }
}

/* Trust Badge */
.trust-badge {
  @apply inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-blue-700 
         rounded-full text-sm font-medium mb-8 shadow-lg shadow-blue-500/10 border border-blue-100/50
         relative overflow-hidden;
}

.pulse-dot {
  @apply w-2 h-2 bg-green-500 rounded-full;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.badge-shine {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full;
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(100%); }
}

/* Hero Headline */
.hero-headline {
  @apply text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight;
}

.headline-reveal {
  @apply inline-block;
  animation: revealUp 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes revealUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.gradient-text {
  @apply bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent;
}

.hero-description {
  @apply text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed;
}

/* Hero CTA */
.hero-cta {
  @apply flex flex-col sm:flex-row gap-4 justify-center mb-16;
}

.cta-button-hero {
  @apply relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold 
         rounded-xl shadow-xl shadow-blue-500/30 overflow-hidden transition-all duration-300
         hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 hover:-translate-y-1
         flex items-center justify-center;
}

.cta-glow {
  @apply absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 transition-opacity duration-300;
}

.cta-button-hero:hover .cta-glow {
  @apply opacity-20;
}

.cta-button-secondary {
  @apply px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-lg border border-gray-100
         flex items-center justify-center gap-2 transition-all duration-300
         hover:shadow-xl hover:border-blue-200 hover:scale-105 hover:-translate-y-1;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto px-2 sm:px-0;
}

.stat-card {
  @apply relative bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border border-white/50
         overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90;
}

.stat-value {
  @apply text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent;
}

.stat-label {
  @apply text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium;
}

.stat-shine {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full;
  animation: statShine 4s ease-in-out infinite;
}

@keyframes statShine {
  0% { transform: translateX(-100%) rotate(12deg); }
  50%, 100% { transform: translateX(200%) rotate(12deg); }
}

/* Scroll Indicator - Fixed */
.scroll-indicator {
  @apply absolute bottom-4 left-1/2 hidden sm:flex flex-col items-center gap-1 text-gray-400 no-underline;
  transform: translateX(-50%);
  animation: scrollFadeIn 1s ease-out 1.2s forwards;
  opacity: 0;
  z-index: 20;
}

@keyframes scrollFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.scroll-mouse {
  @apply w-5 h-8 rounded-full border-2 border-gray-300/70 flex justify-center;
  padding-top: 6px;
}

.scroll-wheel {
  @apply w-1 h-1.5 bg-gray-400 rounded-full;
  animation: scrollWheel 1.5s ease-in-out infinite;
}

@keyframes scrollWheel {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(3px); opacity: 0.4; }
}

.scroll-text {
  @apply text-xs font-medium text-gray-400 hidden sm:block;
}

.scroll-arrow {
  @apply w-4 h-4 text-gray-400;
  animation: scrollBounce 2s ease-in-out infinite;
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

/* ===== FEATURES SECTION ===== */
.features-section {
  @apply py-24 bg-white relative;
}

.section-header {
  @apply text-center mb-16;
}

.section-badge {
  @apply inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4
         border border-blue-100;
}

.section-badge-blue {
  @apply bg-blue-50 text-blue-600 border-blue-100;
}

.section-badge-green {
  @apply bg-green-50 text-green-600 border-green-100;
}

.section-title {
  @apply text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4;
}

.section-subtitle {
  @apply text-gray-600 max-w-2xl mx-auto text-lg;
}

.features-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8;
}

.feature-card {
  @apply relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-100
         overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

.feature-card:active {
  transform: scale(0.98);
}

.feature-card:hover {
  @apply border-transparent;
}

.feature-icon {
  @apply w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transition-transform duration-300;
}

.feature-card:hover .feature-icon {
  @apply scale-110;
}

.gradient-blue { @apply bg-gradient-to-br from-blue-500 to-blue-600 text-white; }
.gradient-green { @apply bg-gradient-to-br from-green-500 to-emerald-600 text-white; }
.gradient-purple { @apply bg-gradient-to-br from-purple-500 to-violet-600 text-white; }
.gradient-orange { @apply bg-gradient-to-br from-orange-500 to-amber-500 text-white; }
.gradient-cyan { @apply bg-gradient-to-br from-cyan-500 to-teal-500 text-white; }
.gradient-pink { @apply bg-gradient-to-br from-pink-500 to-rose-500 text-white; }

.feature-title {
  @apply text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3;
}

.feature-description {
  @apply text-gray-600 text-sm sm:text-base leading-relaxed;
}

.feature-glow {
  @apply absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500;
}

.feature-card:hover .feature-glow {
  @apply opacity-30;
}

.glow-blue { @apply bg-blue-400; }
.glow-green { @apply bg-green-400; }
.glow-purple { @apply bg-purple-400; }
.glow-orange { @apply bg-orange-400; }
.glow-cyan { @apply bg-cyan-400; }
.glow-pink { @apply bg-pink-400; }

/* ===== EXAMS SECTION ===== */
.exams-section {
  @apply py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 relative;
}

.exams-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6;
}

.exam-card {
  @apply relative bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden
         transition-all duration-300 cursor-pointer no-underline block;
  transform-style: preserve-3d;
}

.exam-card:hover {
  @apply shadow-2xl border-blue-200;
  transform: translateY(-8px);
}

.exam-card:active {
  transform: scale(0.98);
}

.exam-card-inner {
  @apply p-5 sm:p-6 lg:p-8 text-center relative z-10;
}

.exam-icon {
  @apply w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg
         transition-transform duration-300;
}

.exam-card:hover .exam-icon {
  @apply scale-110;
}

.exam-icon span {
  @apply text-lg sm:text-xl lg:text-2xl font-bold text-white;
}

.exam-gradient-blue { @apply bg-gradient-to-br from-blue-500 to-blue-700; }
.exam-gradient-green { @apply bg-gradient-to-br from-green-500 to-emerald-600; }
.exam-gradient-purple { @apply bg-gradient-to-br from-purple-500 to-violet-600; }
.exam-gradient-orange { @apply bg-gradient-to-br from-orange-500 to-red-500; }

.exam-title {
  @apply text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2;
}

.exam-description {
  @apply text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2;
}

.exam-subjects {
  @apply flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-4;
}

.exam-subject {
  @apply px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium;
}

.exam-cta {
  @apply w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm sm:text-base 
         font-semibold rounded-xl transition-all duration-300 hover:from-blue-600 hover:to-blue-700
         hover:shadow-lg active:scale-95;
}

.pill-blue { @apply bg-blue-100 text-blue-700; }
.pill-green { @apply bg-green-100 text-green-700; }
.pill-purple { @apply bg-purple-100 text-purple-700; }
.pill-orange { @apply bg-orange-100 text-orange-700; }

.exam-shine {
  @apply absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent 
         -translate-x-full -translate-y-full rotate-12 transition-transform duration-700;
}

.exam-card:hover .exam-shine {
  @apply translate-x-full translate-y-full;
}

/* Coming Soon */
.coming-soon {
  @apply text-center mt-12;
}

.coming-soon-text {
  @apply text-gray-600 mb-4;
}

.coming-soon-badges {
  @apply flex flex-wrap gap-3 justify-center;
}

.coming-soon-badge {
  @apply px-4 py-2 bg-white rounded-full text-gray-600 text-sm font-medium shadow-sm border border-gray-200
         transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:text-blue-600;
}

/* ===== HOW IT WORKS SECTION ===== */
.how-section {
  @apply py-24 bg-white relative;
}

.steps-container {
  @apply relative;
}

.steps-line {
  @apply absolute top-8 left-[12.5%] right-[12.5%] h-1 bg-gray-100 rounded-full overflow-hidden;
}

.steps-line-progress {
  @apply h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full;
  width: 0%;
  animation: progressLine 2s ease-out 0.5s forwards;
}

@keyframes progressLine {
  to { width: 100%; }
}

/* Desktop Steps Grid */
.steps-grid-desktop {
  @apply grid grid-cols-4 gap-8;
}

.step-card-desktop {
  @apply text-center relative;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

.step-number {
  @apply relative w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white 
         text-2xl font-bold shadow-lg z-10;
}

.step-gradient-1 { @apply bg-gradient-to-br from-blue-500 to-blue-600; }
.step-gradient-2 { @apply bg-gradient-to-br from-cyan-500 to-blue-500; }
.step-gradient-3 { @apply bg-gradient-to-br from-purple-500 to-violet-600; }
.step-gradient-4 { @apply bg-gradient-to-br from-green-500 to-emerald-500; }

.step-title {
  @apply text-xl font-bold text-gray-900 mb-3;
}

.step-description {
  @apply text-gray-600;
}

/* Mobile Timeline Styles */
.timeline-container {
  @apply relative pl-4;
}

.timeline-item {
  @apply flex gap-4 pb-8 last:pb-0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.timeline-line-container {
  @apply flex flex-col items-center flex-shrink-0;
}

.timeline-dot {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg z-10;
}

.timeline-connector {
  @apply w-0.5 flex-1 min-h-[60px] rounded-full mt-2;
}

.connector-1 {
  @apply bg-gradient-to-b from-blue-500 to-cyan-500;
}

.connector-2 {
  @apply bg-gradient-to-b from-cyan-500 to-purple-500;
}

.connector-3 {
  @apply bg-gradient-to-b from-purple-500 to-green-500;
}

.timeline-content {
  @apply flex-1 bg-white rounded-2xl p-5 shadow-md border border-gray-100 -mt-1;
}

.timeline-title {
  @apply text-lg font-bold text-gray-900 mb-2;
}

.timeline-description {
  @apply text-gray-600 text-sm leading-relaxed;
}

/* ===== CTA SECTION ===== */
.cta-section {
  @apply py-24 relative overflow-hidden;
}

.cta-bg {
  @apply absolute inset-0;
}

.cta-gradient {
  @apply absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500;
  animation: gradientShift 8s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.cta-particles {
  @apply absolute inset-0;
}

.particle {
  @apply absolute rounded-full bg-white/30;
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  animation: particleFloat var(--duration) ease-in-out var(--delay) infinite;
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-30px) scale(1.2); opacity: 0.6; }
}

.cta-glow-orb {
  @apply absolute rounded-full blur-3xl;
}

.cta-orb-1 {
  @apply w-96 h-96 bg-cyan-400/20 -top-48 -left-48;
  animation: float 10s ease-in-out infinite;
}

.cta-orb-2 {
  @apply w-80 h-80 bg-blue-400/20 -bottom-40 -right-40;
  animation: float 10s ease-in-out infinite reverse;
}

.cta-headline {
  @apply text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6;
}

.cta-subheadline {
  @apply text-xl text-blue-100 mb-10 max-w-2xl mx-auto;
}

.cta-buttons {
  @apply flex flex-col sm:flex-row gap-4 justify-center;
}

.cta-btn-white {
  @apply px-10 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-2xl
         flex items-center justify-center gap-2 transition-all duration-300
         hover:scale-105 hover:-translate-y-1;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.cta-btn-white:hover {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
}

.cta-btn-outline {
  @apply px-10 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl
         transition-all duration-300 hover:bg-white/10;
}

/* ===== FOOTER ===== */
.footer {
  @apply bg-gray-900 text-gray-400 py-16 relative overflow-hidden;
}

.footer-glow {
  @apply absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent;
}

.footer-grid {
  @apply grid md:grid-cols-4 gap-12 mb-12;
}

.footer-brand {
  @apply md:col-span-2;
}

.footer-heading {
  @apply text-white font-semibold mb-4;
}

.footer-link {
  @apply text-gray-400 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block;
}

.social-links {
  @apply flex gap-4 mt-6;
}

.social-link {
  @apply w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white
         transition-all duration-300 hover:bg-blue-600 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30;
}

.social-link-youtube:hover {
  @apply bg-red-600 hover:shadow-red-500/30;
}

.footer-bottom {
  @apply border-t border-gray-800 pt-8 text-center text-sm;
}

/* ===== ANIMATIONS ===== */
.animate-fade-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-float-slow {
  animation: floatSlow 6s ease-in-out infinite;
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}
</style>
