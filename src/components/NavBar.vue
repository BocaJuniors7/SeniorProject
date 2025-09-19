<template>
  <header class="navbar">
    <nav class="nav-container">
      <!-- Logo and Brand -->
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
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
          <span class="brand-text">PawMatch</span>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="nav-links">
        <template v-if="user">
          <router-link to="/discover" class="nav-link">Discover</router-link>
          <router-link to="/profile" class="nav-link">Profile</router-link>
          <router-link to="/matches" class="nav-link">Matches</router-link>
          <router-link to="/messages" class="nav-link">Messages</router-link>

        </template>
        <template v-else>
          <router-link to="/" class="nav-link">Home</router-link>
        </template>
      </div>

      <!-- User Actions -->
      <div class="nav-actions">
        <template v-if="user">
          <div class="user-info">
            <span class="user-email">{{ user.email }}</span>
            <button @click="logout" class="logout-btn">Logout</button>
          </div>
        </template>
        <template v-else>
          <div class="auth-links">
            <router-link to="/login" class="auth-link">Login</router-link>
            <router-link to="/signup" class="auth-link auth-link-primary">Sign Up</router-link>
          </div>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import { signOutFirebase } from '../firebase'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const logout = async () => {
  await signOutFirebase()
}
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #6A2C4A;
  font-weight: bold;
  font-size: 1.5rem;
  transition: opacity 0.3s ease;
}

.brand-link:hover {
  opacity: 0.8;
}

.paw-icon {
  display: flex;
  align-items: center;
}

.paw-svg {
  width: 32px;
  height: 32px;
}

.brand-text {
  font-family: 'Arial', sans-serif;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #6A2C4A;
  background: #f8f9fa;
}

.nav-link.router-link-active {
  color: #6A2C4A;
  background: #f8f9fa;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #6A2C4A;
  border-radius: 50%;
}

.nav-actions {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: #666;
  font-size: 0.9rem;
}

.logout-btn {
  background: #6A2C4A;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #5a253e;
  transform: translateY(-1px);
}

.auth-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.auth-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: #6A2C4A;
  background: #f8f9fa;
}

.auth-link-primary {
  background: #6A2C4A;
  color: white;
}

.auth-link-primary:hover {
  background: #5a253e;
  color: white;
  transform: translateY(-1px);
}

/* iPhone 14 and similar mobile devices */
@media (max-width: 428px) {
  .nav-container {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .nav-brand {
    order: 1;
  }
  
  .brand-text {
    font-size: 1.1rem;
  }
  
  .paw-svg {
    width: 24px;
    height: 24px;
  }
  
  .nav-actions {
    order: 2;
    flex-shrink: 0;
  }
  
  .user-info {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-end;
  }
  
  .user-email {
    font-size: 0.75rem;
  }
  
  .logout-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .auth-links {
    gap: 0.4rem;
  }
  
  .auth-link {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }
  
  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 0.75rem;
    gap: 0.75rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
}

/* Tablet and larger mobile devices */
@media (min-width: 429px) and (max-width: 768px) {
  .nav-container {
    padding: 1rem;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .brand-text {
    font-size: 1.2rem;
  }
  
  .paw-svg {
    width: 28px;
    height: 28px;
  }
  
  .user-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
  
  .user-email {
    font-size: 0.8rem;
  }
  
  .auth-links {
    gap: 0.5rem;
  }
  
  .auth-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}

/* Desktop and larger screens */
@media (min-width: 769px) {
  .nav-container {
    padding: 1rem 2rem;
    gap: 2rem;
  }
  
  .nav-links {
    gap: 2rem;
  }
  
  .nav-link {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  
  .brand-text {
    font-size: 1.5rem;
  }
  
  .paw-svg {
    width: 32px;
    height: 32px;
  }
  
  .user-info {
    flex-direction: row;
    gap: 1rem;
    align-items: center;
  }
  
  .user-email {
    font-size: 0.9rem;
  }
  
  .auth-links {
    gap: 1rem;
  }
  
  .auth-link {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
}
</style>
