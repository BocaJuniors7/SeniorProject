<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-header">
        <div class="paw-icon">
          <svg viewBox="0 0 100 100" class="paw-svg">
            <!-- Main paw pad (heart-shaped) -->
            <path d="M50 85 C38 85, 32 75, 32 65 C32 55, 35 50, 38 50 C41 50, 44 55, 50 60 C56 55, 59 50, 62 50 C65 50, 68 55, 68 65 C68 75, 62 85, 50 85 Z" fill="#6A2C4A"/>
            <!-- Four toe pads in arc -->
            <ellipse cx="30" cy="35" rx="7" ry="10" fill="#6A2C4A"/>
            <ellipse cx="41.5" cy="25" rx="7" ry="10" fill="#6A2C4A"/>
            <ellipse cx="58.5" cy="25" rx="7" ry="10" fill="#6A2C4A"/>
            <ellipse cx="70" cy="35" rx="7" ry="10" fill="#6A2C4A"/>
          </svg>
        </div>
        <h1>Join PawMatch</h1>
        <p>Create your account to start connecting with other dog breeders</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input 
            v-model="form.firstName" 
            type="text" 
            id="firstName" 
            required 
            placeholder="Enter your first name"
          />
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input 
            v-model="form.lastName" 
            type="text" 
            id="lastName" 
            required 
            placeholder="Enter your last name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            v-model="form.email" 
            type="email" 
            id="email" 
            required 
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            id="password" 
            required 
            placeholder="Create a password"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            id="confirmPassword" 
            required 
            placeholder="Confirm your password"
          />
        </div>

        <div class="form-group">
          <label for="userType">I am a:</label>
          <select v-model="form.userType" id="userType" required>
            <option value="">Select your role</option>
            <option value="breeder">Dog Breeder</option>
            <option value="buyer">Looking to Buy</option>
            <option value="both">Both Breeder & Buyer</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              v-model="form.agreeToTerms" 
              type="checkbox" 
              required
            />
            <span class="checkmark"></span>
            I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy Policy</a>
          </label>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading">Creating Account...</span>
          <span v-else>Create Account</span>
        </button>

        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
      </form>

      <div class="signup-footer">
        <p>Already have an account? <router-link to="/login" class="link">Sign in here</router-link></p>
        
        <div class="divider">
          <span>Or continue with</span>
        </div>

        <button @click="signInWithGoogle" class="btn btn-google">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithGooglePopup, createUserWithEmailPassword } from '../firebase'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: '',
  agreeToTerms: false
})

const handleSignup = async () => {
  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (form.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await createUserWithEmailPassword(form.email, form.password)
    // User will be automatically redirected by the auth guard
    router.push('/discover')
  } catch (error) {
    errorMessage.value = error.message || 'Failed to create account'
  } finally {
    isLoading.value = false
  }
}

const signInWithGoogle = async () => {
  try {
    await signInWithGooglePopup()
    router.push('/discover')
  } catch (error) {
    errorMessage.value = error.message || 'Failed to sign in with Google'
  }
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.signup-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  border: 2px solid #66B3FF;
}

.signup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.paw-icon {
  margin-bottom: 1rem;
}

.paw-svg {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.signup-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.signup-header p {
  color: #666;
  font-size: 1rem;
}

.signup-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #6A2C4A;
}

.checkbox-group {
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
  transform: scale(1.2);
}

.btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #6A2C4A;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a253e;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(106, 44, 74, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-google {
  background: white;
  color: #333;
  border: 2px solid #e9ecef;
}

.btn-google:hover {
  background: #f8f9fa;
  border-color: #6A2C4A;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  border: 1px solid #fcc;
}

.signup-footer {
  text-align: center;
}

.signup-footer p {
  margin-bottom: 1.5rem;
  color: #666;
}

.link {
  color: #6A2C4A;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.divider {
  position: relative;
  margin: 1.5rem 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .signup-page {
    padding: 1rem;
  }
  
  .signup-container {
    padding: 2rem;
  }
  
  .signup-header h1 {
    font-size: 1.5rem;
  }
}
</style>
