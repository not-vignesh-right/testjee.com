<template>
  <div class="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Professional Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 pointer-events-none"></div>
    
    <!-- Animated Orbs -->
    <div class="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-blue-200/30 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-cyan-100/40 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>

    <div class="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden relative z-10 flex flex-col md:flex-row border border-white/60 animate-fade-in-up">
      
      <!-- Left Side: Order Summary -->
      <div class="md:w-5/12 bg-gradient-to-br from-gray-50 to-white p-8 md:p-10 border-r border-gray-100 flex flex-col justify-center">
        <div class="mb-8 animate-slide-in-left">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 border border-blue-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Checkout
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Order Summary</h2>
          <p class="text-gray-500 text-sm">Review your package details before paying.</p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 animate-slide-in-left" style="animation-delay: 100ms;">
          <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div>
              <div class="flex items-center gap-2">
                <p class="font-bold text-gray-900 text-lg">Mock Test Package</p>
                <button @click="showPlanSelector = !showPlanSelector" class="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors">
                  {{ showPlanSelector ? 'Close' : 'Change Plan' }}
                </button>
              </div>
              <p class="text-gray-500 text-sm">{{ pricing.count }} Full-Length {{ pricing.count === 1 ? 'Exam' : 'Exams' }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-gray-900 text-lg">₹{{ pricing.totalPrice }}</p>
              <p class="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded mt-1">₹{{ pricing.pricePerExam }} / exam</p>
            </div>
          </div>

          <!-- Plan Selection Grid (visible when editing) -->
          <div v-if="showPlanSelector" class="mb-6 animate-fade-in">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select New Package</p>
            <div class="grid grid-cols-4 gap-2">
              <button 
                v-for="preset in PRESET_PACKAGES" 
                :key="preset"
                @click="updatePlan(preset)"
                class="py-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center"
                :class="testCount === preset 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-100 bg-white hover:border-blue-200'"
              >
                <span class="text-sm font-bold text-gray-900">{{ preset }}</span>
                <span class="text-[9px] text-gray-500">exams</span>
              </button>
            </div>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-500">
              <span>Original Price</span>
              <span class="line-through">₹{{ pricing.originalPrice }}</span>
            </div>
            <div v-if="pricing.discountPercent > 0" class="flex justify-between text-green-600 font-medium bg-green-50/50 p-2 rounded-lg -mx-2">
              <span>Volume Discount ({{ pricing.discountPercent }}%)</span>
              <span>-₹{{ pricing.savingsAmount }}</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span class="font-bold text-gray-900">Total to Pay</span>
            <span class="text-2xl font-black text-blue-600 tracking-tight">₹{{ pricing.totalPrice }}</span>
          </div>
        </div>

        <div class="animate-slide-in-left" style="animation-delay: 200ms;">
          <div class="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm font-medium">
            <svg class="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p><strong>Manual Approval Process.</strong> After you pay, an admin will verify the transaction and approve your account within 24 hours.</p>
          </div>
        </div>
      </div>

      <!-- Right Side: Payment Details -->
      <div class="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative">
        <div class="text-center mb-8 animate-fade-in" style="animation-delay: 300ms;">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Scan to Pay</h3>
          <p class="text-gray-500">Pay securely using any UPI app like GPay, PhonePe, or Paytm.</p>
        </div>

        <div class="flex flex-col items-center animate-fade-in" style="animation-delay: 400ms;">
          <!-- QR Code Container -->
          <div class="relative p-6 bg-white border-2 border-dashed border-blue-200 rounded-3xl shadow-sm mb-8 group hover:border-blue-400 transition-colors">
            <div class="absolute inset-0 bg-blue-50/30 rounded-3xl -z-10 group-hover:bg-blue-50/50 transition-colors"></div>
            <img :src="qrImage" alt="UPI QR Code" class="w-48 h-48 md:w-56 md:h-56 object-cover rounded-xl shadow-sm mix-blend-multiply" />
            
            <!-- Scan overlay effect (visual only) -->
            <div class="absolute left-6 right-6 top-6 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-50 blur-[1px] group-hover:animate-scan"></div>
          </div>

          <!-- UPI Details Box -->
          <div class="w-full max-w-sm bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-8">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm text-gray-500 font-medium">Pay to:</span>
              <span class="text-base font-bold text-gray-900">{{ upiDetails.name }}</span>
            </div>
            
            <div class="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <div class="min-w-0 pr-2">
                <p class="text-xs text-gray-400 font-medium mb-0.5">UPI ID</p>
                <p class="text-sm font-bold text-gray-800 font-mono truncate select-all">{{ upiDetails.id }}</p>
              </div>
              <button 
                @click="copyUpiId" 
                class="flex-shrink-0 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors flex items-center justify-center relative shadow-sm"
                title="Copy UPI ID"
              >
                <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <svg v-else class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col w-full max-w-sm gap-4">
            <!-- Mobile App Button (visible mostly on mobile due to upi:// protocol handling) -->
            <a 
              :href="upiDeepLink"
              class="w-full bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold py-3.5 rounded-xl shadow-sm transition-all transform active:scale-95 flex justify-center items-center gap-2 md:hidden"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              Open UPI App
            </a>

            <!-- Primary Action -->
            <button 
              @click="confirmPayment" 
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200/50 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
            >
              I have completed the payment
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>

          <!-- Contact Support -->
          <div class="mt-8 text-center animate-fade-in" style="animation-delay: 500ms;">
            <p class="text-sm text-gray-500">Need help? Contact us on WhatsApp</p>
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
              +91 7353560013
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPriceDetails, PRESET_PACKAGES } from '../data/pricing'
import qrImage from '../assets/payment_upi_qr.jpeg'

const router = useRouter()
const route = useRoute()

// UPI Details from the image
const upiDetails = {
  name: 'Purnendu Mishra Mishra',
  id: 'allen.purnendu@okaxis',
  phone: '7353560013'
}

// Plan Management
const testCount = ref(parseInt(route.query.tests) || 5)
const showPlanSelector = ref(false)

const pricing = computed(() => getPriceDetails(testCount.value))

function updatePlan(count) {
  testCount.value = count
  showPlanSelector.value = false
  // Update query string without reloading
  router.replace({ query: { ...route.query, tests: count } })
}

// Generate UPI Deep Link
const upiDeepLink = computed(() => {
  const pa = encodeURIComponent(upiDetails.id);
  const pn = encodeURIComponent(upiDetails.name);
  const am = pricing.value.totalPrice.toString();
  const cu = 'INR';
  const tn = encodeURIComponent(`TESTJEE Mock Tests (${testCount.value} pack)`);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`;
})

const whatsappLink = computed(() => `https://wa.me/917353560013?text=${encodeURIComponent(`Hi, I need help with my Testjee mock test payment. I requested ${testCount.value} tests.`)}`)

const copied = ref(false)

function copyUpiId() {
  navigator.clipboard.writeText(upiDetails.id)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function confirmPayment() {
  // Store the payment status/intent locally so the waiting page can show a tailored message
  localStorage.setItem('paymentAttempted', 'true')
  router.push('/waiting-approval?step=admin')
}
</script>

<style scoped>
@keyframes scan {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translateY(13rem); opacity: 0; }
}

.animate-scan {
  animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

.animate-slide-in-left {
  animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
