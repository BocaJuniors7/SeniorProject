<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-header">
      <h1>Profile</h1>
      <div class="header-actions">
        <button class="preview-btn" @click="showPreview = true" :disabled="!currentUser || !dogProfile.name">
          Preview Profile
        </button>
        <button class="save-all-btn" @click="saveProfile" :disabled="saving || !currentUser">
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
        <button @click="toggleMenu" class="menu-btn" aria-label="Open menu">
          <svg class="menu-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Rest of your existing template content stays the same -->
    <!-- I'm just adding the preview button and component -->

    <!-- Profile Preview Modal -->
    <ProfilePreview
      v-if="showPreview"
      :profile="dogProfile"
      :photos="photos"
      @close="showPreview = false"
      @edit="showPreview = false; setActiveTab('basic')"
      @like="handleLike"
      @pass="handlePass"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db, storage } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import ProfilePreview from '../components/ProfilePreview.vue'

const router = useRouter()

// Add preview state
const showPreview = ref(false)

// Rest of your existing script content stays the same
// Just add these new functions:

const handleLike = () => {
  console.log('Profile liked!')
  showPreview.value = false
}

const handlePass = () => {
  console.log('Profile passed!')
  showPreview.value = false
}

// ... rest of your existing code ...
</script>

<style scoped>
/* Add preview button styles */
.preview-btn {
  background: #6A2C4A;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.5rem;
}

.preview-btn:hover:enabled {
  background: #5a2438;
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(106, 44, 74, 0.3);
}

.preview-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Rest of your existing styles stay the same */
</style>
