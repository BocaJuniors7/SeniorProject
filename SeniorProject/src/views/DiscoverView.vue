<!-- src/views/DiscoverView.vue -->
<template>
  <div class="discover-page" v-cloak>
    <!-- Profile gate (only after check completes and user has no profile) -->
    <div
      v-if="!checkingProfile && hasProfile === false"
      class="profile-gate"
      aria-live="polite"
    >
      <div class="gate-card">
        <div class="gate-icon">🐶</div>
        <h2>Create a dog profile to start discovering</h2>
        <p>You’ll need at least one dog profile before you can browse others.</p>
        <button class="gate-btn" @click="goToProfileCreate">Create your dog profile</button>
      </div>
    </div>

    <!-- Normal Discover UI only when a profile exists -->
    <template v-if="!checkingProfile && hasProfile">
      <!-- Header -->
      <header class="discover-header">
        <h1>Discover Dogs</h1>

        <!-- centered selector + label -->
        <div class="header-center" v-if="myDogs.length">
          <label for="activeDog" class="with-text">Discover with</label>
          <select id="activeDog" v-model="activeDogId" class="dog-select">
            <option v-for="d in myDogs" :key="d.id" :value="d.id">
              {{ d.name || 'Unnamed' }}
            </option>
          </select>
        </div>

        <!-- right side actions -->
        <div class="header-right">
          <button @click="toggleFilters" class="filters-btn">Filters</button>
        </div>
      </header>

      <!-- Filters Panel -->
      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <label>Breed</label>
          <select v-model="filters.breed">
            <option value="">All Breeds</option>
            <option value="golden retriever">Golden Retriever</option>
            <option value="labrador">Labrador</option>
            <option value="german shepherd">German Shepherd</option>
            <option value="bulldog">Bulldog</option>
            <option value="poodle">Poodle</option>
            <option value="beagle">Beagle</option>
            <option value="rottweiler">Rottweiler</option>
            <option value="yorkie">Yorkie</option>
            <option value="dachshund">Dachshund</option>
            <option value="siberian husky">Siberian Husky</option>
            <option value="boxer">Boxer</option>
            <option value="australian shepherd">Australian Shepherd</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Sex</label>
          <select v-model="filters.sex">
            <option value="">All</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Weight Range (lbs)</label>
          <div class="age-range">
            <input v-model="filters.minWeight" type="number" placeholder="Min" min="0" max="200">
            <span>-</span>
            <input v-model="filters.maxWeight" type="number" placeholder="Max" min="0" max="200">
          </div>
        </div>
        <div class="filter-group">
          <label>Age Range</label>
          <div class="age-range">
            <input v-model="filters.minAge" type="number" placeholder="Min" min="0" max="20">
            <span>-</span>
            <input v-model="filters.maxAge" type="number" placeholder="Max" min="0" max="20">
          </div>
        </div>
        <div class="filter-group">
          <label>Distance</label>
          <select v-model="filters.distance">
            <option value="10">Within 10 miles</option>
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
            <option value="75">Within 75 miles</option>
            <option value="100">Within 100 miles</option>
          </select>
        </div>
        <button @click="applyFilters" class="apply-filters-btn">Apply Filters</button>
      </div>

      <!-- Loading State -->
      <div v-if="isFiltering" class="filtering-overlay">
        <div class="filtering-content">
          <div class="filtering-spinner">🐾</div>
          <p>Finding dogs near you...</p>
        </div>
      </div>

      <!-- Dog Cards Stack -->
      <div class="cards-container">
        <div v-if="dogs.length === 0" class="no-dogs">
          <div class="no-dogs-icon">🐕</div>
          <h3>No more dogs to discover!</h3>
          <p>Check back later for new profiles or adjust your filters.</p>

          <div class="no-dogs-actions">
            <button @click="resetFilters" class="btn btn-primary">Reset Filters</button>
            <button @click="replayPassedDogs" class="btn btn-secondary">Show Passed Dogs Again</button>
          </div>
        </div>

        <div
          v-for="(dog, index) in dogs"
          :key="dog.id"
          :class="['dog-card', { 'active': index === 0 }]"
          :style="{ zIndex: dogs.length - index, '--offset': cardOffset + 'px', '--rotation': (cardOffset/20) + 'deg' }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        >
          <div class="card-image">
            <img v-if="dog.image" :src="dog.image" :alt="dog.name" />
            <div v-else class="no-photo" style="display:flex;align-items:center;justify-content:center;height:100%;background:#eee;color:#666;">
              <span>no photo</span>
            </div>
            <div class="card-overlay">
              <div class="dog-info">
                <h2>{{ dog.name }}, {{ dog.age }}</h2>
                <p>{{ dog.breed }} • {{ dog.location }}</p>
              </div>
            </div>
          </div>

          <div class="card-details">
            <div class="info-section">
              <div class="detail-row">
                <span class="label">Sex:</span>
                <span class="value">{{ dog.sex }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Weight:</span>
                <span class="value">{{ dog.weight }} lbs</span>
              </div>
            </div>

            <div v-if="dog.temperament" class="content-section">
              <h4>About {{ dog.name }}</h4>
              <p class="temperament">{{ dog.temperament }}</p>
            </div>

            <div v-if="hasTrainingInfo(dog)" class="content-section">
              <h4>Training & Certifications</h4>
              <div v-if="dog.trainingLevel" class="training-level">
                <span class="label">Training Level:</span>
                <span class="value">{{ dog.trainingLevel }}</span>
              </div>
              <div v-if="dog.certifications && dog.certifications.length > 0" class="certifications">
                <span class="label">Certifications:</span>
                <div class="cert-badges">
                  <span v-for="cert in dog.certifications" :key="cert" class="cert-badge">
                    {{ certDisplay(cert) }}
                  </span>
                </div>
              </div>
              <div v-if="dog.trainingNotes" class="training-notes">
                <p>{{ dog.trainingNotes }}</p>
              </div>
            </div>

            <div v-if="dog.medicalPapers && dog.medicalPapers.length > 0" class="content-section">
              <h4>Health Certifications</h4>
              <div class="medical-papers">
                <div v-for="(paper, index) in dog.medicalPapers" :key="index" class="paper-item">
                  <div class="paper-icon">📄</div>
                  <div class="paper-info">
                    <span class="paper-name">{{ paper.name || 'Health Certificate' }}</span>
                    <span class="paper-date">{{ paper.date || 'Date not specified' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="hasPreferences(dog)" class="content-section">
              <h4>Breeding Preferences</h4>
              <div v-if="dog.lookingFor" class="preference-item">
                <span class="label">Looking for:</span>
                <span class="value">{{ dog.lookingFor }}</span>
              </div>
              <div v-if="dog.preferredBreeds" class="preference-item">
                <span class="label">Preferred breeds:</span>
                <span class="value">{{ dog.preferredBreeds }}</span>
              </div>
              <div v-if="dog.minAgePref || dog.maxAgePref" class="preference-item">
                <span class="label">Age preference:</span>
                <span class="value">{{ agePreferenceDisplay(dog) }}</span>
              </div>
              <div v-if="dog.travelDistance" class="preference-item">
                <span class="label">Willing to travel:</span>
                <span class="value">{{ dog.travelDistance }} miles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="passDog" class="action-btn pass-btn" :disabled="!activeDogId">
          <svg class="action-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <button @click="likeDog" class="action-btn like-btn" :disabled="!activeDogId || dogs.length===0">
          <svg class="action-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <!-- Brief celebratory flash (optional) -->
      <div v-if="showMatchAnimation" class="match-animation">
        <div class="match-overlay"></div>
        <div class="match-content">
          <div class="match-bubbles">
            <div class="bubble bubble-1">💕</div>
            <div class="bubble bubble-2">🎉</div>
            <div class="bubble bubble-3">💖</div>
            <div class="bubble bubble-4">✨</div>
            <div class="bubble bubble-5">💝</div>
            <div class="bubble bubble-6">🎊</div>
          </div>
          <div class="match-text">
            <h2>It's a Match!</h2>
            <p>You and {{ matchedDog?.name }} liked each other!</p>
          </div>
        </div>
      </div>

      <!-- Match Modal -->
      <div
        v-if="showMatchModal"
        class="match-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Match dialog"
        tabindex="0"
      >
        <div class="match-backdrop"></div>
        <div class="match-card" role="document">
          <button class="match-close" @click="closeMatchModal" aria-label="Close">×</button>

          <div class="match-header">
            <div class="match-emoji">💘</div>
            <h2>It’s a Match!</h2>
            <p>{{ (activeDog?.name || 'Your dog') }} &amp; {{ matchedDog?.name }} like each other</p>
          </div>

          <div class="match-photos">
            <div class="match-photo">
              <img :src="activeDog?.image || ''" :alt="activeDog?.name || 'Your dog'" />
              <span class="photo-label">{{ activeDog?.name || 'Your dog' }}</span>
            </div>
            <div class="vs">✦</div>
            <div class="match-photo">
              <img :src="matchedDog?.image || ''" :alt="matchedDog?.name || 'Matched dog'" />
              <span class="photo-label">{{ matchedDog?.name || 'Matched dog' }}</span>
            </div>
          </div>

          <div class="match-actions">
            <button class="match-btn primary" @click="startChatWithMatch">Message</button>
          </div>
        </div>
      </div>

      <!-- Chat Interface (demo; stays hidden now) -->
      <div v-if="showChat" class="chat-interface">
        <div class="chat-header">
          <div class="chat-dog-info">
            <img :src="matchedDog?.image" :alt="matchedDog?.name" class="chat-dog-avatar" />
            <div>
              <h3>{{ matchedDog?.name }}</h3>
              <p>{{ matchedDog?.ownerName }}</p>
            </div>
          </div>
          <button @click="closeChat" class="close-chat-btn">×</button>
        </div>

        <div class="chat-messages">
          <div
            v-for="message in chatMessages"
            :key="message.id"
            :class="['message', { 'own-message': message.sender === 'You' }]"
          >
            <div class="message-content">
              <span class="message-sender" v-if="message.sender !== 'You'">{{ message.sender }}</span>
              <p class="message-text">{{ message.message }}</p>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type a message..."
            class="message-input"
          />
          <button @click="sendMessage" class="send-btn" :disabled="!newMessage.trim()">
            <svg class="send-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div v-if="showMenu" class="nav-menu">
        <div class="nav-overlay" @click="toggleMenu"></div>
        <div class="nav-content">
          <div class="nav-item" @click="goToProfile"><span>Profile</span></div>
          <div class="nav-item active" @click="toggleMenu"><span>Discover Dogs</span></div>
          <div class="nav-item" @click="goToMatches"><span>Matches</span></div>
          <div class="nav-item" @click="goToSettings"><span>Settings</span></div>
        </div>
      </div>

      <!-- Filtering Overlay (duplicate for safety) -->
      <div v-if="isFiltering" class="filtering-overlay">
        <div class="filtering-content">
          <div class="filtering-spinner">🐾</div>
          <p>Finding dogs near you...</p>
        </div>
      </div>
    </template>

    <!-- Small “checking profile” placeholder -->
    <div v-if="checkingProfile" class="checking-gate">
      <p>Checking your profile…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listDogs } from '../services/dogs'
import { createLike, createPass } from '../services/likes'
import { collection, query, where, limit, getDocs, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const router = useRouter()

// State
const showFilters = ref(false)
const showMenu = ref(false)
const dogs = ref([])
const currentUser = ref(null)
const matches = ref([])
const showMatchAnimation = ref(false)
const matchedDog = ref(null)
const showChat = ref(false)
const chatMessages = ref([])
const newMessage = ref('')
const isFiltering = ref(false)
const filterError = ref('')

// Modal state (cannot be dismissed by Esc/backdrop)
const showMatchModal = ref(false)

// Profile gate state
const hasProfile = ref(false)
const checkingProfile = ref(true)

// Touch/Mouse handling
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const cardOffset = ref(0)

// Filters
const filters = reactive({
  breed: '',
  sex: '',
  minWeight: '',
  maxWeight: '',
  minAge: '',
  maxAge: '',
  distance: '25'
})

// Hard-coded dogs near Lakeland, FL with various distances
// Lakeland coordinates: 28.0395° N, 81.9498° W
const LAKELAND_COORDS = { lat: 28.0395, lng: -81.9498 }

// Helper to calculate coordinates at a given distance and bearing from Lakeland
function getCoordsAtDistance(distanceMiles, bearingDegrees) {
  const R = 3963.19 // Earth radius in miles
  const lat1 = LAKELAND_COORDS.lat * Math.PI / 180
  const lng1 = LAKELAND_COORDS.lng * Math.PI / 180
  const bearing = bearingDegrees * Math.PI / 180
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceMiles / R) +
    Math.cos(lat1) * Math.sin(distanceMiles / R) * Math.cos(bearing)
  )
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(distanceMiles / R) * Math.cos(lat1),
    Math.cos(distanceMiles / R) - Math.sin(lat1) * Math.sin(lat2)
  )
  
  return {
    lat: lat2 * 180 / Math.PI,
    lng: lng2 * 180 / Math.PI
  }
}

// Generate hard-coded dogs
const HARDCODED_DOGS = [
  // 25 miles - Winter Haven area
  { name: 'Max', breed: 'Golden Retriever', sex: 'M', age: 3, weight: 65, location: 'Winter Haven, FL', distance: 25, coords: getCoordsAtDistance(25, 45), ownerName: 'Sarah Johnson', temperament: 'Friendly and energetic', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop' },
  { name: 'Bella', breed: 'Labrador', sex: 'F', age: 2, weight: 55, location: 'Winter Haven, FL', distance: 25, coords: getCoordsAtDistance(25, 90), ownerName: 'Mike Davis', temperament: 'Playful and loving', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop' },
  { name: 'Rocky', breed: 'German Shepherd', sex: 'M', age: 4, weight: 75, location: 'Bartow, FL', distance: 25, coords: getCoordsAtDistance(25, 180), ownerName: 'Jennifer Smith', temperament: 'Loyal and protective', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop' },
  { name: 'Luna', breed: 'Poodle', sex: 'F', age: 1, weight: 45, location: 'Auburndale, FL', distance: 25, coords: getCoordsAtDistance(25, 270), ownerName: 'David Wilson', temperament: 'Smart and elegant', image: 'https://images.unsplash.com/photo-1616190174711-3e3e6d4e5b5a?w=400&h=400&fit=crop' },
  { name: 'Charlie', breed: 'Bulldog', sex: 'M', age: 5, weight: 50, location: 'Davenport, FL', distance: 25, coords: getCoordsAtDistance(25, 315), ownerName: 'Lisa Anderson', temperament: 'Calm and gentle', image: 'https://images.unsplash.com/photo-1520087619250-584c0cbd35e8?w=400&h=400&fit=crop' },
  
  // 50 miles - Tampa/Orlando area
  { name: 'Daisy', breed: 'Beagle', sex: 'F', age: 2, weight: 25, location: 'Tampa, FL', distance: 50, coords: getCoordsAtDistance(50, 45), ownerName: 'Robert Brown', temperament: 'Curious and friendly', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop' },
  { name: 'Zeus', breed: 'Rottweiler', sex: 'M', age: 3, weight: 95, location: 'Tampa, FL', distance: 50, coords: getCoordsAtDistance(50, 90), ownerName: 'Amanda Taylor', temperament: 'Confident and calm', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Molly', breed: 'Golden Retriever', sex: 'F', age: 4, weight: 60, location: 'Orlando, FL', distance: 50, coords: getCoordsAtDistance(50, 135), ownerName: 'Christopher Lee', temperament: 'Gentle and patient', image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop' },
  { name: 'Buddy', breed: 'Labrador', sex: 'M', age: 2, weight: 70, location: 'Orlando, FL', distance: 50, coords: getCoordsAtDistance(50, 180), ownerName: 'Michelle White', temperament: 'Energetic and outgoing', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=400&fit=crop' },
  { name: 'Sophie', breed: 'Poodle', sex: 'F', age: 3, weight: 40, location: 'Kissimmee, FL', distance: 50, coords: getCoordsAtDistance(50, 225), ownerName: 'Daniel Martinez', temperament: 'Intelligent and active', image: 'https://images.unsplash.com/photo-1616190174711-3e3e6d4e5b5a?w=400&h=400&fit=crop' },
  { name: 'Tucker', breed: 'German Shepherd', sex: 'M', age: 5, weight: 80, location: 'Plant City, FL', distance: 50, coords: getCoordsAtDistance(50, 270), ownerName: 'Nicole Garcia', temperament: 'Brave and obedient', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop' },
  { name: 'Ruby', breed: 'Bulldog', sex: 'F', age: 2, weight: 48, location: 'Brandon, FL', distance: 50, coords: getCoordsAtDistance(50, 315), ownerName: 'Kevin Rodriguez', temperament: 'Sweet and docile', image: 'https://images.unsplash.com/photo-1520087619250-584c0cbd35e8?w=400&h=400&fit=crop' },
  
  // 75 miles - Further out
  { name: 'Oscar', breed: 'Boxer', sex: 'M', age: 3, weight: 65, location: 'Sarasota, FL', distance: 75, coords: getCoordsAtDistance(75, 45), ownerName: 'Stephanie Lopez', temperament: 'Playful and devoted', image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop' },
  { name: 'Penny', breed: 'Beagle', sex: 'F', age: 1, weight: 22, location: 'Clearwater, FL', distance: 75, coords: getCoordsAtDistance(75, 90), ownerName: 'Ryan Harris', temperament: 'Merry and determined', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop' },
  { name: 'Duke', breed: 'Australian Shepherd', sex: 'M', age: 4, weight: 55, location: 'St. Petersburg, FL', distance: 75, coords: getCoordsAtDistance(75, 135), ownerName: 'Lauren Clark', temperament: 'Smart and work-oriented', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Mia', breed: 'Yorkie', sex: 'F', age: 2, weight: 7, location: 'Largo, FL', distance: 75, coords: getCoordsAtDistance(75, 180), ownerName: 'Justin Lewis', temperament: 'Bold and confident', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Jack', breed: 'Dachshund', sex: 'M', age: 3, weight: 18, location: 'New Port Richey, FL', distance: 75, coords: getCoordsAtDistance(75, 225), ownerName: 'Rachel Walker', temperament: 'Clever and lively', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Lily', breed: 'Siberian Husky', sex: 'F', age: 2, weight: 50, location: 'Ocala, FL', distance: 75, coords: getCoordsAtDistance(75, 270), ownerName: 'Brandon Hall', temperament: 'Outgoing and mischievous', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Cooper', breed: 'Golden Retriever', sex: 'M', age: 4, weight: 68, location: 'Gainesville, FL', distance: 75, coords: getCoordsAtDistance(75, 315), ownerName: 'Emily Young', temperament: 'Friendly and reliable', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop' },
  
  // 100 miles - Even further
  { name: 'Chloe', breed: 'Labrador', sex: 'F', age: 3, weight: 58, location: 'Jacksonville, FL', distance: 100, coords: getCoordsAtDistance(100, 45), ownerName: 'Tyler King', temperament: 'Outgoing and even-tempered', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop' },
  { name: 'Rex', breed: 'German Shepherd', sex: 'M', age: 5, weight: 85, location: 'Daytona Beach, FL', distance: 100, coords: getCoordsAtDistance(100, 90), ownerName: 'Samantha Wright', temperament: 'Confident and courageous', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop' },
  { name: 'Zoey', breed: 'Poodle', sex: 'F', age: 2, weight: 42, location: 'Melbourne, FL', distance: 100, coords: getCoordsAtDistance(100, 135), ownerName: 'Nathan Scott', temperament: 'Active and proud', image: 'https://images.unsplash.com/photo-1616190174711-3e3e6d4e5b5a?w=400&h=400&fit=crop' },
  { name: 'Bear', breed: 'Rottweiler', sex: 'M', age: 4, weight: 100, location: 'Fort Myers, FL', distance: 100, coords: getCoordsAtDistance(100, 180), ownerName: 'Jessica Green', temperament: 'Steady and self-assured', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Princess', breed: 'Yorkie', sex: 'F', age: 1, weight: 6, location: 'Naples, FL', distance: 100, coords: getCoordsAtDistance(100, 225), ownerName: 'Andrew Adams', temperament: 'Tenacious and feisty', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Sam', breed: 'Boxer', sex: 'M', age: 3, weight: 70, location: 'Cape Coral, FL', distance: 100, coords: getCoordsAtDistance(100, 270), ownerName: 'Megan Baker', temperament: 'Bright and fun-loving', image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop' },
  { name: 'Coco', breed: 'Dachshund', sex: 'F', age: 2, weight: 16, location: 'Punta Gorda, FL', distance: 100, coords: getCoordsAtDistance(100, 315), ownerName: 'Joshua Nelson', temperament: 'Friendly and curious', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  
  // More variety at different distances
  { name: 'Thor', breed: 'Siberian Husky', sex: 'M', age: 3, weight: 52, location: 'Leesburg, FL', distance: 50, coords: getCoordsAtDistance(50, 0), ownerName: 'Ashley Hill', temperament: 'Athletic and friendly', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Nala', breed: 'Australian Shepherd', sex: 'F', age: 2, weight: 50, location: 'Clermont, FL', distance: 50, coords: getCoordsAtDistance(50, 45), ownerName: 'Matthew Carter', temperament: 'Smart and energetic', image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop' },
  { name: 'Gus', breed: 'Bulldog', sex: 'M', age: 4, weight: 52, location: 'Lakeland, FL', distance: 0, coords: LAKELAND_COORDS, ownerName: 'Brittany Phillips', temperament: 'Calm and courageous', image: 'https://images.unsplash.com/photo-1520087619250-584c0cbd35e8?w=400&h=400&fit=crop' },
  { name: 'Rosie', breed: 'Beagle', sex: 'F', age: 1, weight: 24, location: 'Lakeland, FL', distance: 0, coords: LAKELAND_COORDS, ownerName: 'Jordan Campbell', temperament: 'Merry and friendly', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop' },
  { name: 'Leo', breed: 'Golden Retriever', sex: 'M', age: 5, weight: 72, location: 'Mulberry, FL', distance: 15, coords: getCoordsAtDistance(15, 180), ownerName: 'Taylor Parker', temperament: 'Intelligent and kind', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop' },
  { name: 'Stella', breed: 'Labrador', sex: 'F', age: 2, weight: 62, location: 'Haines City, FL', distance: 20, coords: getCoordsAtDistance(20, 90), ownerName: 'Alexis Evans', temperament: 'Outgoing and even-tempered', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop' },
].map((dog, index) => ({
  ...dog,
  id: `hardcoded_${index}`,
  ownerId: `hardcoded_owner_${index}`,
  _id: `hardcoded_${index}`,
  docId: `hardcoded_${index}`,
  gallery: [dog.image],
  photos: [{ url: dog.image }],
  ownerLocation: dog.location,
  createdAt: { toMillis: () => Date.now() - (index * 86400000) },
  updatedAt: { toMillis: () => Date.now() - (index * 86400000) }
}))

/* ---------------- My dogs + active dog selector ---------------- */
const myDogs = ref([])          // [{id, name, image}]
const activeDogId = ref('')     // id of the dog that will be used as fromDogId
const activeDog = computed(() => myDogs.value.find(d => d.id === activeDogId.value) || null)

/* Live listener to user's dogs to keep gate accurate */
let offDogs = null
function watchMyDogs(userUid) {
  if (offDogs) { offDogs(); offDogs = null }
  const qDogs = query(collection(db, 'dogs'), where('ownerId', '==', userUid))
  offDogs = onSnapshot(qDogs, (snap) => {
    const list = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name || 'Unnamed',
        image: Array.isArray(data.gallery) && data.gallery.length ? data.gallery[0] :
               Array.isArray(data.photos) && data.photos.length ? (typeof data.photos[0] === 'string' ? data.photos[0] : data.photos[0]?.url || '') : ''
      }
    })
    myDogs.value = list
    hasProfile.value = list.length > 0

    // If no dogs remain, clear active dog & deck (gate shows automatically)
    if (!hasProfile.value) {
      activeDogId.value = ''
      dogs.value = []
    } else {
      // Select a default active dog if none
      if (!activeDogId.value || !list.some(d => d.id === activeDogId.value)) {
        activeDogId.value = list[0].id
        // fresh deck on first dog or after switching last deleted
        loadDogs()
      }
    }
  })
}

/* ---------------- Per-dog hidden & passed lists (local) ---------------- */
const DISMISSED_PREFIX = 'discover_dismissed_v1'   // hidden list (passed + liked)
const PASSED_PREFIX = 'discover_passed_v1'

function keyFor(prefix) {
  if (!currentUser.value?.uid || !activeDogId.value) return ''
  return `${prefix}:${currentUser.value.uid}:${activeDogId.value}`
}

/* Hidden (dismissed) helpers */
function loadDismissed() {
  const k = keyFor(DISMISSED_PREFIX)
  if (!k) return []
  try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] }
}
function saveDismissed(arr) {
  const k = keyFor(DISMISSED_PREFIX)
  if (!k) return
  localStorage.setItem(k, JSON.stringify(arr))
}
function markDismissed(id) {
  if (!id) return
  const arr = loadDismissed()
  if (!arr.includes(id)) { arr.push(id); saveDismissed(arr) }
}

/* Passed helpers */
function loadPassed() {
  const k = keyFor(PASSED_PREFIX)
  if (!k) return []
  try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] }
}
function savePassed(arr) {
  const k = keyFor(PASSED_PREFIX)
  if (!k) return
  localStorage.setItem(k, JSON.stringify(arr))
}
function markPassed(id) {
  if (!id) return
  const arr = loadPassed()
  if (!arr.includes(id)) { arr.push(id); savePassed(arr) }
}
function clearPassed() {
  const k = keyFor(PASSED_PREFIX)
  if (!k) return
  localStorage.removeItem(k)
}

/* Restore only passed dogs (not liked ones) */
async function replayPassedDogs() {
  const passed = loadPassed()
  if (!passed.length) { await loadDogs(); return }

  const hidden = new Set(loadDismissed())
  for (const id of passed) hidden.delete(id) // unhide just the passed ones
  saveDismissed(Array.from(hidden))
  clearPassed()
  await loadDogs()
}

/* ---------------- Auth/Profile Gate ---------------- */
async function ensureProfileExists () {
  checkingProfile.value = true
  hasProfile.value = false

  const u = auth.currentUser
  if (!u) {
    checkingProfile.value = false
    router.replace('/')
    return false
  }

  currentUser.value = { uid: u.uid }

  // Quick one-time check to end the spinner fast
  const qRef = query(collection(db, 'dogs'), where('ownerId', '==', u.uid), limit(1))
  const snap = await getDocs(qRef)
  hasProfile.value = !snap.empty
  checkingProfile.value = false

  // Start real-time watch to keep gate accurate after create/delete
  watchMyDogs(u.uid)

  // If they already have a dog, load deck now
  if (hasProfile.value) {
    loadDogs()
  }

  return hasProfile.value
}

let offAuth = null
onMounted(async () => {
  const ok = await ensureProfileExists()

  offAuth = onAuthStateChanged(auth, (u) => {
    if (!u) {
      router.replace('/')
      // clean listeners
      if (offDogs) { offDogs(); offDogs = null }
    }
  })
})

onUnmounted(() => {
  if (offAuth) { offAuth(); offAuth = null }
  if (offDogs) { offDogs(); offDogs = null }
})

/* ---------------- Helpers ---------------- */
const certDisplay = (cert) => {
  const certMap = {
    'akc': 'AKC Registered',
    'therapy': 'Therapy Dog Certified',
    'service': 'Service Dog Trained',
    'cpr': 'CPR Certified',
    'obedience': 'Obedience Trained'
  }
  return certMap[cert.toLowerCase()] || cert
}
const hasTrainingInfo = (dog) =>
  dog.trainingLevel || (dog.certifications && dog.certifications.length > 0) || dog.trainingNotes
const hasPreferences = (dog) =>
  dog.lookingFor || dog.preferredBreeds || dog.minAgePref || dog.maxAgePref || dog.travelDistance
const agePreferenceDisplay = (dog) => {
  const min = dog.minAgePref
  const max = dog.maxAgePref
  if (!min && !max) return 'No preference'
  if (min && max) return `${min}-${max} years`
  if (min) return `${min}+ years`
  if (max) return `Up to ${max} years`
  return 'Not specified'
}

// UI helpers
const toggleFilters = () => { showFilters.value = !showFilters.value }
const toggleMenu = () => { showMenu.value = !showMenu.value }
const goToProfileCreate = () => router.push('/profile?create=1')

/* ---------------- Geocoding & distance ---------------- */
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'PawMatch App' } }
    )
    const data = await response.json()
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

const calculateDistance = (userLocation, dogLocation) => {
  const R = 3963.19
  const toRad = (d) => d * Math.PI / 180
  const lat1 = toRad(userLocation.lat)
  const lat2 = toRad(dogLocation.lat)
  const dLat = toRad(dogLocation.lat - userLocation.lat)
  const dLon = toRad(dogLocation.lng - userLocation.lng)
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c * 10) / 10
}

/* ---------------- Image normalization ---------------- */
function firstPhotoUrl(d) {
  if (Array.isArray(d && d.gallery) && d.gallery.length) return d.gallery[0]
  if (Array.isArray(d && d.photos) && d.photos.length) {
    const p0 = d.photos[0]
    if (typeof p0 === 'string') return p0
    if (p0 && typeof p0 === 'object' && 'url' in p0) return p0.url || ''
  }
  return ''
}

function excludeMyDogs(arr) {
  const uid = currentUser.value?.uid
  if (!uid) return arr
  return arr.filter(d => d.ownerId && d.ownerId !== uid)
}

function normalizePhotoArray(d) {
  if (Array.isArray(d && d.gallery) && d.gallery.length) return d.gallery.slice()
  if (Array.isArray(d && d.photos) && d.photos.length) {
    return d.photos.map(p => (typeof p === 'string' ? p : (p && p.url) || '')).filter(Boolean)
  }
  return []
}

/* ---------------- Map Firestore doc to card ---------------- */
function mapDogDocToCard(d) {
  const ageYears = d.age ?? (d.birthdate
    ? Math.max(0, Math.floor((Date.now() - new Date(d.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : '')

  return {
    id: d.id || d._id || d.docId || (d.ownerId + ':' + (d.name || Math.random())),
    name: d.name || 'Unnamed',
    age: ageYears,
    breed: d.breed || '',
    sex: d.sex || '',
    weight: d.weight || d.weightValue || '',
    location: d.ownerLocation || d.location || '',
    temperament: d.temperament || '',
    healthCertified: !!d.healthCertified,
    image: firstPhotoUrl(d),
    ownerId: d.ownerId,
    ownerName: d.ownerName || 'Owner',
    coords: d.coords || null,
    distanceFromUser: d.distance !== undefined ? d.distance : d.distanceFromUser, // Preserve distance for hard-coded dogs
    trainingLevel: d.trainingLevel || '',
    certifications: d.certifications || [],
    trainingNotes: d.trainingNotes || '',
    lookingFor: d.lookingFor || '',
    preferredBreeds: d.preferredBreeds || '',
    minAgePref: d.minAgePref || '',
    maxAgePref: d.maxAgePref || '',
    travelDistance: d.travelDistance || '',
    medicalPapers: d.medicalPapers || [],
    photos: normalizePhotoArray(d),
  }
}

/* ---------------- Seeded Shuffle ---------------- */
// Seeded random number generator (Linear Congruential Generator)
function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

// Shuffle array using a seed (Fisher-Yates with seeded random)
function seededShuffle(array, seed) {
  const rng = seededRandom(seed)
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate a unique seed based on timestamp and active dog
function generateShuffleSeed() {
  const timestamp = Date.now()
  const dogId = activeDogId.value || ''
  const dogIdHash = dogId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Combine timestamp with dog ID hash to ensure different seed each time
  return timestamp + dogIdHash + Math.floor(Math.random() * 1000)
}

/* ---------------- Load & Filter ---------------- */
async function loadDogs() {
  if (!hasProfile.value || !activeDogId.value) {
    dogs.value = []
    return
  }
  isFiltering.value = true
  try {
    // Get dogs from Firestore
    const docs = await listDogs({ onlyWithPhotos: false, max: 50, breed: filters.breed || undefined })
    const firestoreDogs = excludeMyDogs(docs.map(mapDogDocToCard))
    
    // Add hard-coded dogs
    const hardcodedCards = excludeMyDogs(HARDCODED_DOGS.map(mapDogDocToCard))
    
    // Combine both sources
    const allDogs = [...firestoreDogs, ...hardcodedCards]
    
    // Apply basic filters
    let filtered = allDogs
    
    // Filter by breed
    if (filters.breed) {
      const breedLower = filters.breed.toLowerCase()
      filtered = filtered.filter(d => d.breed?.toLowerCase() === breedLower)
    }
    
    // Filter by sex
    if (filters.sex) {
      filtered = filtered.filter(d => d.sex === filters.sex)
    }
    
    // Filter by weight
    if (filters.minWeight) {
      filtered = filtered.filter(d => Number(d.weight) >= Number(filters.minWeight))
    }
    if (filters.maxWeight) {
      filtered = filtered.filter(d => Number(d.weight) <= Number(filters.maxWeight))
    }
    
    // Filter by age
    if (filters.minAge) {
      filtered = filtered.filter(d => Number(d.age) >= Number(filters.minAge))
    }
    if (filters.maxAge) {
      filtered = filtered.filter(d => Number(d.age) <= Number(filters.maxAge))
    }
    
    // Filter by distance
    if (filters.distance) {
      const maxDistance = Number(filters.distance)
      const userLocation = LAKELAND_COORDS // Use Lakeland as base location
      
      filtered = filtered.map(dog => {
        // Calculate distance if we have coords
        if (dog.coords && dog.coords.lat && dog.coords.lng) {
          const dist = calculateDistance(userLocation, dog.coords)
          return { ...dog, distanceFromUser: dist }
        }
        return dog
      }).filter(dog => {
        // Filter by distance
        if (dog.distanceFromUser !== undefined) {
          return dog.distanceFromUser <= maxDistance
        }
        // If no coords and no distance, include it (might be from Firestore without location)
        return true
      })
    }
    
    const hidden = new Set(loadDismissed())
    filtered = filtered.filter(d => !hidden.has(d.id))
    
    // Shuffle with a new seed each time to ensure different order
    const shuffleSeed = generateShuffleSeed()
    dogs.value = seededShuffle(filtered, shuffleSeed)
  } catch (e) {
    console.error(e)
    filterError.value = 'Failed to load dogs'
  } finally {
    isFiltering.value = false
  }
}

const applyFilters = async () => {
  if (!hasProfile.value || !activeDogId.value) return
  isFiltering.value = true
  
  try {
    // Get dogs from Firestore
    const docs = await listDogs({
      breed: filters.breed || undefined,
      sex: filters.sex || undefined,
      onlyWithPhotos: false,
      max: 60
    })
    const firestoreDogs = excludeMyDogs(docs.map(mapDogDocToCard))
    
    // Add hard-coded dogs
    const hardcodedCards = excludeMyDogs(HARDCODED_DOGS.map(mapDogDocToCard))
    
    // Combine both sources
    let filteredDogs = [...firestoreDogs, ...hardcodedCards]

    // Filter by breed
    if (filters.breed) {
      const b = filters.breed.toLowerCase()
      filteredDogs = filteredDogs.filter(dog => dog.breed?.toLowerCase() === b)
    }
    
    // Filter by sex
    if (filters.sex) {
      filteredDogs = filteredDogs.filter(dog => dog.sex === filters.sex)
    }
    
    // Filter by weight
    if (filters.minWeight) {
      filteredDogs = filteredDogs.filter(dog => Number(dog.weight) >= Number(filters.minWeight))
    }
    if (filters.maxWeight) {
      filteredDogs = filteredDogs.filter(dog => Number(dog.weight) <= Number(filters.maxWeight))
    }
    
    // Filter by age
    if (filters.minAge) {
      filteredDogs = filteredDogs.filter(dog => Number(dog.age) >= Number(filters.minAge))
    }
    if (filters.maxAge) {
      filteredDogs = filteredDogs.filter(dog => Number(dog.age) <= Number(filters.maxAge))
    }

    // Filter by distance
    if (filters.distance) {
      const maxDistance = Number(filters.distance)
      const userLocation = LAKELAND_COORDS // Use Lakeland as base location

      const out = []
      for (const dog of filteredDogs) {
        let dogLoc = dog.coords
        // For hard-coded dogs, coords are already set
        if (!(dogLoc && dogLoc.lat && dogLoc.lng) && dog.location && !dog.distanceFromUser) {
          // Only geocode if not already hard-coded
          dogLoc = await geocodeAddress(dog.location)
          await new Promise(r => setTimeout(r, 200)) // Rate limit
        }
        
        if (dogLoc && dogLoc.lat && dogLoc.lng) {
          const dist = calculateDistance(userLocation, dogLoc)
          if (dist <= maxDistance) {
            out.push({ ...dog, distanceFromUser: dist })
          }
        } else if (dog.distanceFromUser !== undefined) {
          // Hard-coded dog with distance
          if (dog.distanceFromUser <= maxDistance) {
            out.push(dog)
          }
        }
      }
      filteredDogs = out
    }

    const hidden = new Set(loadDismissed())
    filteredDogs = filteredDogs.filter(d => !hidden.has(d.id))

    // Shuffle with a new seed each time to ensure different order
    const shuffleSeed = generateShuffleSeed()
    dogs.value = seededShuffle(filteredDogs, shuffleSeed)
  } catch (error) {
    console.error('Error applying filters:', error)
    filterError.value = 'Failed to apply filters'
  } finally {
    showFilters.value = false
    isFiltering.value = false
  }
}

const resetFilters = () => {
  filters.breed = ''
  filters.sex = ''
  filters.minWeight = ''
  filters.maxWeight = ''
  filters.minAge = ''
  filters.maxAge = ''
  filters.distance = '25'
  loadDogs()
}

/* ---------------- Matches (local demo store) ---------------- */
const MATCHES_KEY = 'demo_matches'
function loadStoredMatches() { try { return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]') } catch { return [] } }
function saveStoredMatches(arr) { localStorage.setItem(MATCHES_KEY, JSON.stringify(arr)) }
function addMatchToStorage(dog) {
  const existing = loadStoredMatches()
  if (!existing.some(m => m.id === dog.id)) {
    existing.unshift({ ...dog, matchedAt: Date.now() })
    saveStoredMatches(existing)
    window.dispatchEvent(new Event('matches-updated'))
  }
}

/* ---------------- Firestore reciprocal like check ---------------- */
async function hasReciprocalLike(otherDogId, myDogId) {
  try {
    let snap = await getDocs(
      query(
        collection(db, 'likes'),
        where('fromDogId', '==', otherDogId),
        where('toDogId', '==', myDogId),
        where('type', '==', 'like'),
        limit(1)
      )
    )
    if (!snap.empty) return true

    snap = await getDocs(
      query(
        collection(db, 'likes'),
        where('fromDogId', '==', otherDogId),
        where('toDogId', '==', myDogId),
        where('kind', '==', 'like'),
        limit(1)
      )
    )
    if (!snap.empty) return true

    snap = await getDocs(
      query(
        collection(db, 'likes'),
        where('fromDogId', '==', otherDogId),
        where('toDogId', '==', myDogId),
        limit(1)
      )
    )
    return !snap.empty
  } catch (e) {
    console.error('Reciprocal like check failed:', e)
    return false
  }
}

/* ---------------- Deck actions ---------------- */
const passDog = async () => {
  if (dogs.value.length === 0) return
  if (!activeDogId.value) {
    alert('Choose which of your dogs is passing first.')
    return
  }

  const passedDog = dogs.value.shift()
  if (passedDog) {
    // hide now AND remember as "passed" for restore
    markDismissed(passedDog.id)
    markPassed(passedDog.id)
  }

  try {
    await createPass({
      toDogId: passedDog.id,
      toDogOwnerId: passedDog.ownerId,
      fromDogId: activeDogId.value
    })
  } catch (e) {
    console.error('Pass failed:', e)
  }
}

const likeDog = async () => {
  if (dogs.value.length === 0) return
  if (!activeDogId.value) {
    alert('Choose which of your dogs is liking first.')
    return
  }

  const likedDog = dogs.value.shift()
  if (!likedDog) return

  // hide now, but DO NOT add to "passed" list
  markDismissed(likedDog.id)

  let res = null
  try {
    res = await createLike({
      toDogId: likedDog.id,
      toDogOwnerId: likedDog.ownerId,
      fromDogId: activeDogId.value
    })
  } catch (e) {
    console.error('Like failed:', e)
  }

  let isMatch = false
  if (res && (res.isMatch === true || res.match === true)) {
    isMatch = true
  } else {
    isMatch = await hasReciprocalLike(likedDog.id, activeDogId.value)
  }

  if (isMatch) {
    matches.value.push(likedDog)
    addMatchToStorage(likedDog)
    matchedDog.value = likedDog

    showMatchAnimation.value = true
    setTimeout(() => {
      showMatchAnimation.value = false
      showMatchModal.value = true
      document.documentElement.style.overflow = 'hidden'
    }, 700)
  }
}

/* ---------------- React when switching active dog ---------------- */
watch(activeDogId, async (newId, oldId) => {
  if (!newId || newId === oldId) return
  isDragging.value = false
  cardOffset.value = 0
  await loadDogs()
})

/* ---------------- Drag handlers ---------------- */
const handleTouchStart = (e) => { isDragging.value = true; startX.value = e.touches[0].clientX }
const handleTouchMove  = (e) => { if (!isDragging.value) return; currentX.value = e.touches[0].clientX; cardOffset.value = currentX.value - startX.value }
const handleTouchEnd   = () => { if (!isDragging.value) return; isDragging.value = false; if (Math.abs(cardOffset.value) > 100) { cardOffset.value > 0 ? likeDog() : passDog() } cardOffset.value = 0 }
const handleMouseDown  = (e) => { isDragging.value = true; startX.value = e.clientX }
const handleMouseMove  = (e) => { if (!isDragging.value) return; currentX.value = e.clientX; cardOffset.value = currentX.value - startX.value }
const handleMouseUp    = () => { if (!isDragging.value) return; isDragging.value = false; if (Math.abs(cardOffset.value) > 100) { cardOffset.value > 0 ? likeDog() : passDog() } cardOffset.value = 0 }

/* ---------------- Nav ---------------- */
const goToProfile = () => { router.push('/profile'); showMenu.value = false }
const goToMatches = () => { router.push('/matches'); showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }

/* ---------------- Chat (demo - not used on Message click now) ---------------- */
const getRandomResponse = () => {
  const responses = [
    "That's wonderful! When would be a good time to meet?",
    "I'm so excited! Tango sounds like a perfect match for my dog.",
    "Do you have any questions about her health records?",
    "She loves playing fetch and going on long walks!",
    "I can send you more photos if you'd like to see them.",
    "She's been socialized with other dogs since she was a puppy."
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  chatMessages.value.push({ id: Date.now(), sender: 'You', message: newMessage.value, timestamp: new Date() })
  newMessage.value = ''
  setTimeout(() => {
    chatMessages.value.push({ id: Date.now() + 1, sender: matchedDog.value?.ownerName || 'Owner', message: getRandomResponse(), timestamp: new Date() })
  }, 1200)
}

const closeChat = () => { showChat.value = false; matchedDog.value = null; chatMessages.value = [] }
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// Open Messages page from modal (also dismisses the modal; no mini-chat)
const startChatWithMatch = () => {
  const withId = matchedDog.value?.id
  showMatchModal.value = false
  document.documentElement.style.overflow = ''
  showChat.value = false
  chatMessages.value = []

  if (withId) {
    router.push({ path: '/messages', query: { with: withId, fromDog: activeDogId.value } })
  } else {
    router.push('/messages')
  }
}

// Close modal via top-right only (continue browsing)
const closeMatchModal = () => {
  showMatchModal.value = false
  document.documentElement.style.overflow = ''
}


</script>

<style scoped>
/* NOTE: DO NOT put the [v-cloak] rule here (scoped). It must be global. */

.discover-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

/* Header with centered selector and right-aligned filters button */
.discover-header {
  background: #6A2C4A;
  color: white;
  padding: 1rem 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}
.discover-header h1 { font-size: 1.5rem; margin: 0; }
.header-center { justify-self: center; display: flex; align-items: center; gap: .5rem; }
.with-text { font-weight: 700; opacity: .95; }
.dog-select {
  appearance: none;
  background: white;
  color: #6A2C4A;
  border: none;
  border-radius: 999px;
  padding: .45rem .9rem;
  font-weight: 700;
  cursor: pointer;
}
.header-right { justify-self: end; }
.filters-btn {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 999px;
  padding: .45rem .9rem;
  font-weight: 700;
  cursor: pointer;
}
.filters-btn:hover { background: rgba(255,255,255,.12); }

/* Profile gate overlay */
.profile-gate {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(106,44,74,0.9), rgba(106,44,74,0.95));
  display: grid;
  place-items: center;
  z-index: 2000;
  padding: 2rem;
  color: white;
}
.gate-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  padding: 2rem 2.5rem;
  max-width: 520px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.gate-icon { font-size: 3rem; margin-bottom: .75rem }
.gate-card h2 { margin: 0 0 .5rem 0; font-size: 1.6rem; }
.gate-card p { margin: 0 0 1.25rem 0; opacity: 0.9; }
.gate-btn {
  background: #fff;
  color: #6A2C4A;
  border: none;
  padding: .9rem 1.25rem;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
}
.gate-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.25) }

/* small “checking” state */
.checking-gate {
  min-height: 60vh;
  display: grid;
  place-items: center;
  color: #6A2C4A;
  font-weight: 600;
}

.filters-panel {
  background: white;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.filter-group { margin-bottom: 1rem; }
.filter-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
.filter-group select, .filter-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
}
.age-range { display: flex; align-items: center; gap: 0.5rem; }
.age-range input { flex: 1; }
.apply-filters-btn {
  background: #6A2C4A;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.cards-container {
  position: relative;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.dog-card {
  position: absolute;
  width: 300px;
  height: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
  cursor: grab;
  transition: transform 0.3s ease;
}
.dog-card:active { cursor: grabbing; }
.dog-card.active { transform: translateX(var(--offset, 0px)) rotate(var(--rotation, 0deg)); }

.card-image { position: relative; height: 60%; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 1rem;
  color: white;
}
.dog-info h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; }
.dog-info p { margin: 0; opacity: 0.9; }

.card-details { padding: 1rem; height: 40%; overflow-y: auto; }
.detail-row {
  display: flex; justify-content: space-between;
  margin-bottom: 0.5rem; padding: 0.25rem 0;
  border-bottom: 1px solid #f0f0f0;
}
.detail-row:last-child { border-bottom: none; }
.label { font-weight: 600; color: #666; }
.value { color: #333; }

.info-section { margin-bottom: 1rem; }
.content-section { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f0f0f0; }
.content-section:last-child { border-bottom: none; }
.content-section h4 { margin: 0 0 0.75rem 0; font-size: 1rem; font-weight: 600; color: #333; }
.temperament { margin: 0; line-height: 1.4; color: #555; font-size: 0.9rem; }

.training-level, .certifications, .training-notes { margin-bottom: 0.75rem; }
.cert-badges { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem; }
.cert-badge { background: #6A2C4A; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 500; }

.medical-papers { display: flex; flex-direction: column; gap: 0.5rem; }
.paper-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 6px; }
.paper-info { display: flex; flex-direction: column; gap: 0.1rem; }
.paper-name { font-weight: 600; color: #333; font-size: 0.85rem; }
.paper-date { font-size: 0.7rem; color: #666; }

/* No dogs state */
.no-dogs { text-align: center; color: #666; }
.no-dogs-icon { font-size: 4rem; margin-bottom: 1rem; }
.no-dogs-actions {
  margin-top: 1rem;
  display: flex;
  gap: .5rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons (local) */
.btn {
  border-radius: 999px;
  padding: .6rem 1rem;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid transparent;
}
.btn-primary {
  background: #6A2C4A;
  color: #fff;
}
.btn-primary:hover { filter: brightness(1.05); }
.btn-secondary {
  background: #fff;
  color: #6A2C4A;
  border-color: #6A2C4A;
}
.btn-secondary:hover { background: rgba(106,44,74,.06); }

.action-buttons {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: 2rem; z-index: 50;
}
.action-btn {
  width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s ease;
}
.pass-btn { background: #ff4757; color: white; }
.like-btn { background: #2ed573; color: white; }
.action-btn:hover { transform: scale(1.1); }
.action-btn:disabled { opacity: .5; cursor: not-allowed; }
.action-icon { width: 24px; height: 24px; }

.nav-menu { position: fixed; top: 0; right: 0; width: 100%; height: 100%; z-index: 200; }
.nav-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.nav-content { position: absolute; top: 0; right: 0; width: 250px; height: 100%; background: #6A2C4A; padding: 2rem 0; }
.nav-item { padding: 1rem 2rem; color: white; cursor: pointer; transition: background-color 0.3s ease; }
.nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); }

.match-animation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2500; display: flex; align-items: center; justify-content: center; }
.match-overlay { position: absolute; inset: 0; background: rgba(106, 44, 74, 0.9); }
.match-content { position: relative; z-index: 1; text-align: center; color: white; }
.bubble { position: absolute; font-size: 2rem; animation: float 2s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0px) scale(1) } 50% { transform: translateY(-20px) scale(1.1) } }
.chat-interface { position: fixed; bottom: 0; right: 0; width: 400px; height: 500px; background: white; border-radius: 20px 20px 0 0; box-shadow: 0 -5px 20px rgba(0,0,0,0.2); z-index: 500; display: flex; flex-direction: column; }

/* Match Modal (blocking; only close via X or Message) */
.match-modal { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; pointer-events: none; }
.match-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.55); backdrop-filter: blur(3px); }
.match-card {
  position: relative;
  width: min(92vw, 560px);
  background: #fff;
  border-radius: 20px;
  padding: 1.25rem 1.25rem 1.5rem;
  box-shadow: 0 30px 80px rgba(0,0,0,.35);
  animation: pop-in .18s ease-out;
  pointer-events: all;
}
@keyframes pop-in { from { transform: scale(.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }

.match-close {
  position: absolute; top: .5rem; right: .7rem;
  width: 36px; height: 36px; border-radius: 50%;
  border: none; background: transparent; color: #6A2C4A; font-size: 1.5rem; cursor: pointer;
}

.match-header { text-align: center; color: #6A2C4A; margin-top: .25rem; }
.match-header h2 { margin: .25rem 0 0; font-size: 1.6rem; }
.match-header p { margin: .25rem 0 0; color: #5a1f3d; font-weight: 600; }
.match-emoji { font-size: 2rem; }

.match-photos {
  display: flex; align-items: center; justify-content: center;
  gap: 1rem; margin: 1rem 0 1.25rem;
}
.match-photo { display: grid; justify-items: center; gap: .4rem; }
.match-photo img {
  width: 120px; height: 120px; object-fit: cover;
  border-radius: 50%; border: 4px solid #fff; box-shadow: 0 8px 24px rgba(0,0,0,.15);
  background: #f2f2f2;
}
.photo-label { font-size: .9rem; color: #333; font-weight: 600; }
.vs { color: #6A2C4A; font-weight: 800; }

.match-actions { display: flex; justify-content: center; gap: .75rem; }
.match-btn {
  padding: .8rem 1.2rem; border-radius: 999px; font-weight: 700; cursor: pointer; border: 2px solid transparent;
}
.match-btn.primary { background: #6A2C4A; color: #fff; }
.match-btn.primary:hover { filter: brightness(1.05); }

/* Responsive header stacking */
@media (max-width: 640px) {
  .discover-header {
    grid-template-columns: 1fr;
    gap: .5rem;
    text-align: center;
  }
  .header-center { justify-self: center; }
  .header-right { justify-self: center; }
}
</style>
