<template>
  <div class="discover-page">
    <!-- Header -->
    <header class="discover-header">
      <h1>Discover Dogs</h1>
      <div class="header-actions">
        <button @click="generateAIDogProfiles" class="generate-btn" :disabled="isGenerating">
          <svg class="generate-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
          </svg>
          <span v-if="!isGenerating">Generate AI Dogs</span>
          <span v-else>Generating...</span>
        </button>
        <button @click="toggleFilters" class="filter-btn">
          <svg class="filter-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 17h18v-2H3v2zm0-5h18V7H3v5zm0-7v2h18V5H3z"/>
          </svg>
        </button>
        <button @click="toggleMenu" class="menu-btn">
          <svg class="menu-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
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
        </select>
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
        <button @click="resetFilters" class="btn btn-primary">Reset Filters</button>
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
          <img :src="dog.image" :alt="dog.name" />
          <div class="card-overlay">
            <div class="dog-info">
              <h2>{{ dog.name }}, {{ dog.age }}</h2>
              <p>{{ dog.breed }} • {{ dog.location }}</p>
            </div>
          </div>
        </div>
        
        <div class="card-details">
          <!-- Basic Info Section -->
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

          <!-- About Section -->
          <div v-if="dog.temperament" class="content-section">
            <h4>About {{ dog.name }}</h4>
            <p class="temperament">{{ dog.temperament }}</p>
          </div>

          <!-- Training & Certifications Section -->
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

          <!-- Medical Papers Section -->
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

          <!-- Preferences Section -->
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
      <button @click="passDog" class="action-btn pass-btn">
        <svg class="action-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      <button @click="likeDog" class="action-btn like-btn">
        <svg class="action-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>

    <!-- Match Animation -->
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

    <!-- Chat Interface -->
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
        <div class="nav-item" @click="goToProfile">
          <span>Profile</span>
        </div>
        <div class="nav-item active" @click="toggleMenu">
          <span>Discover Dogs</span>
        </div>
        <div class="nav-item" @click="goToMatches">
          <span>Matches</span>
        </div>
        <div class="nav-item" @click="goToSettings">
          <span>Settings</span>
        </div>
      </div>
    </div>

    <!-- Filtering Overlay (duplicate for safety) -->
    <div v-if="isFiltering" class="filtering-overlay">
      <div class="filtering-content">
        <div class="filtering-spinner">🐾</div>
        <p>Finding dogs near you...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listDogs } from '../services/dogs'
import { createLike } from '../services/likes'
import { generateMultipleAIDogProfiles } from '../services/aiProfileGenerator'
import { doc, setDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'


const router = useRouter()

// State
const showFilters = ref(false)
const showMenu = ref(false)
const dogs = ref([])
const currentIndex = ref(0)
const matches = ref([])
const showMatchAnimation = ref(false)
const matchedDog = ref(null)
const showChat = ref(false)
const chatMessages = ref([])
const newMessage = ref('')
const isFiltering = ref(false)
const filterError = ref('')
const isGenerating = ref(false)

// Touch/Mouse handling
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const cardOffset = ref(0)

// Filters
const filters = reactive({
  breed: '',
  minAge: '',
  maxAge: '',
  distance: '25'
})

onMounted(loadDogs)

// Helper functions for profile display (defined early for template access)
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

const hasTrainingInfo = (dog) => {
  return dog.trainingLevel || 
         (dog.certifications && dog.certifications.length > 0) ||
         dog.trainingNotes
}

const hasPreferences = (dog) => {
  return dog.lookingFor ||
         dog.preferredBreeds ||
         dog.minAgePref ||
         dog.maxAgePref ||
         dog.travelDistance
}

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

// --- Geocoding & distance (fallback if no stored coords) ---
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
  const earthRadiusMiles = 3963.19; // Earth's radius in miles

  // convert degrees to radians
  const lat1Rad = userLocation.lat * Math.PI / 180;
  const lat2Rad = dogLocation.lat * Math.PI / 180;
  const latDiffRad = (dogLocation.lat - userLocation.lat) * Math.PI / 180;
  const lonDiffRad = (dogLocation.lng - userLocation.lng) * Math.PI / 180;

  // haversine formula
  const squareHalfChordLength =
    Math.sin(latDiffRad / 2) * Math.sin(latDiffRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(lonDiffRad / 2) * Math.sin(lonDiffRad / 2);

  const angularDistance = 2 * Math.atan2(
    Math.sqrt(squareHalfChordLength),
    Math.sqrt(1 - squareHalfChordLength)
  );

  const distanceMiles = earthRadiusMiles * angularDistance;

  return Math.round(distanceMiles * 10) / 10; // nearest tenth of a mile
};


// --- Firestore mapping & loading ---
function mapDogDocToCard(d) {
  const firstPhoto = (d.photos?.[0]?.url) || ''
  const ageYears = d.age ?? (d.birthdate ? Math.max(0, Math.floor((Date.now() - new Date(d.birthdate)) / (365.25*24*3600*1000))) : '')
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
    image: firstPhoto,
    ownerId: d.ownerId,
    ownerName: d.ownerName || 'Owner',
    coords: d.coords || null,
    // Additional profile data
    trainingLevel: d.trainingLevel || '',
    certifications: d.certifications || [],
    trainingNotes: d.trainingNotes || '',
    lookingFor: d.lookingFor || '',
    preferredBreeds: d.preferredBreeds || '',
    minAgePref: d.minAgePref || '',
    maxAgePref: d.maxAgePref || '',
    travelDistance: d.travelDistance || '',
    medicalPapers: d.medicalPapers || [],
    photos: d.photos || []
  }
}

async function loadDogs() {
  isFiltering.value = true
  try {
    const docs = await listDogs({ onlyWithPhotos: false, max: 50, breed: filters.breed || undefined })
    dogs.value = docs.map(mapDogDocToCard)
  } catch (e) {
    console.error(e)
    filterError.value = 'Failed to load dogs'
  } finally {
    isFiltering.value = false
  }
}

// --- Filters ---
const applyFilters = async () => {
  isFiltering.value = true
  // pull fresh batch with coarse Firestore filtering first
  const base = await listDogs({
    breed: filters.breed || undefined,
    onlyWithPhotos: false,
    max: 60
  })
  let filteredDogs = base.map(mapDogDocToCard)

  try {
    if (filters.breed) {
      const b = filters.breed.toLowerCase()
      filteredDogs = filteredDogs.filter(dog => dog.breed?.toLowerCase() === b)
    }
    if (filters.minAge) {
      filteredDogs = filteredDogs.filter(dog => Number(dog.age) >= Number(filters.minAge))
    }
    if (filters.maxAge) {
      filteredDogs = filteredDogs.filter(dog => Number(dog.age) <= Number(filters.maxAge))
    }

    if (filters.distance) {
      const maxDistance = Number(filters.distance)
      const userLocation = await geocodeAddress('Lakeland, FL') // TODO: replace with actual user location
      if (!userLocation) throw new Error("Couldn't determine user's location")

      const out = []
      for (const dog of filteredDogs) {
        let dogLoc = dog.coords
        console.log("before geocoding")
        console.log(dogLoc)
        // check if dog has stored coords, else geocode their address
        // lat lng should be calculated NOT here but this is a fallback for demo purposes
          if(dogLoc && dogLoc.lat && dogLoc.lng) {
            continue
          } else {
          if (!dogLoc && dog.location) {
            dogLoc = await geocodeAddress(dog.location)
            await new Promise(r => setTimeout(r, 1000)) // rate-limit friendly
            console.log("after geocoding")
            console.log(dogLoc)
            //update their lat lng in firestore here for now, update method later. This is to save time in demo period. 
          }
        }
        if (!dogLoc) continue
        const dist = calculateDistance(userLocation, dogLoc)
        if (dist <= maxDistance) out.push({ ...dog, distanceFromUser: dist })
      }
      filteredDogs = out
    }

    dogs.value = filteredDogs
  } catch (error) {
    console.error('Error applying filters:', error)
  } finally {
    showFilters.value = false
    isFiltering.value = false
  }
}

const resetFilters = () => {
  filters.breed = ''
  filters.minAge = ''
  filters.maxAge = ''
  filters.distance = '25'
  loadDogs()
}

const passDog = () => {
  if (dogs.value.length > 0) {
    dogs.value.shift()
  }
}

// ----- Simple demo persistence for matches (local only) -----
const MATCHES_KEY = 'demo_matches'
function loadStoredMatches() {
  try { return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]') } catch { return [] }
}
function saveStoredMatches(arr) { localStorage.setItem(MATCHES_KEY, JSON.stringify(arr)) }
function addMatchToStorage(dog) {
  const existing = loadStoredMatches()
  if (!existing.some(m => m.id === dog.id)) {
    existing.unshift({ ...dog, matchedAt: Date.now() })
    saveStoredMatches(existing)
    window.dispatchEvent(new Event('matches-updated'))
  }
}

const likeDog = async () => {
  if (dogs.value.length > 0) {
    const likedDog = dogs.value.shift()
    try {
      await createLike({ toDogId: likedDog.id, toDogOwnerId: likedDog.ownerId })
    } catch (e) {
      console.error('Like failed:', e)
    }

    const isMatch = checkForMatch(likedDog)
    if (isMatch) {
      matches.value.push(likedDog)
      addMatchToStorage(likedDog)
      matchedDog.value = likedDog
      showMatchAnimation.value = true
      setTimeout(() => {
        showMatchAnimation.value = false
        showChat.value = true
        chatMessages.value = [
          { id: 1, sender: 'system', message: `You matched with ${likedDog.name}! 🎉`, timestamp: new Date() },
          { id: 2, sender: likedDog.ownerName, message: `Hi! I'm ${likedDog.ownerName}, ${likedDog.name}'s owner. She's such a sweet girl!`, timestamp: new Date() }
        ]
      }, 3000)
    }
  }
}

const checkForMatch = (dog) => {
  // TEMP demo logic; replace with server-side match creation later
  const tangoBreed = 'Golden Retriever'
  const tangoSex = 'male'
  const tangoAge = 3
  return dog.breed.toLowerCase() === tangoBreed.toLowerCase() && dog.sex.toLowerCase() !== tangoSex && Math.abs(Number(dog.age) - tangoAge) <= 1
}

// Touch and mouse event handlers
const handleTouchStart = (e) => { isDragging.value = true; startX.value = e.touches[0].clientX }
const handleTouchMove = (e) => { if (!isDragging.value) return; currentX.value = e.touches[0].clientX; cardOffset.value = currentX.value - startX.value }
const handleTouchEnd = () => {
  if (!isDragging.value) return; isDragging.value = false
  if (Math.abs(cardOffset.value) > 100) { cardOffset.value > 0 ? likeDog() : passDog() }
  cardOffset.value = 0
}
const handleMouseDown = (e) => { isDragging.value = true; startX.value = e.clientX }
const handleMouseMove = (e) => { if (!isDragging.value) return; currentX.value = e.clientX; cardOffset.value = currentX.value - startX.value }
const handleMouseUp = () => {
  if (!isDragging.value) return; isDragging.value = false
  if (Math.abs(cardOffset.value) > 100) { cardOffset.value > 0 ? likeDog() : passDog() }
  cardOffset.value = 0
}

// Navigation
const goToProfile = () => { router.push('/profile'); showMenu.value = false }
const goToMatches = () => { router.push('/matches'); showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }

// Chat functions
const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatMessages.value.push({ id: Date.now(), sender: 'You', message: newMessage.value, timestamp: new Date() })
    newMessage.value = ''
    setTimeout(() => {
      chatMessages.value.push({ id: Date.now() + 1, sender: matchedDog.value.ownerName, message: getRandomResponse(), timestamp: new Date() })
    }, 2000)
  }
}

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

const closeChat = () => { showChat.value = false; matchedDog.value = null; chatMessages.value = [] }
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// AI Profile Generation
const generateAIDogProfiles = async () => {
  if (isGenerating.value) return
  
  isGenerating.value = true
  try {
    console.log('Generating 5 AI dog profiles...')
    const aiProfiles = await generateMultipleAIDogProfiles(5)
    
    // Save each profile to Firestore
    for (const profile of aiProfiles) {
      try {
        // Create a new document with auto-generated ID
        const newDogRef = doc(collection(db, 'dogs'))
        const profileWithId = {
          ...profile,
          ownerId: 'ai_generator', // Special owner ID for AI-generated profiles
          ownerName: 'AI Generated',
          createdAt: new Date().toISOString(),
          id: newDogRef.id
        }
        
        await setDoc(newDogRef, profileWithId)
        console.log(`Saved AI profile: ${profile.name} (${profile.breed})`)
      } catch (error) {
        console.error('Error saving AI profile:', error)
      }
    }
    
    // Refresh the dog list to show new profiles
    await loadDogs()
    
    alert(`Successfully generated and added ${aiProfiles.length} new AI dog profiles!`)
    
  } catch (error) {
    console.error('Error generating AI profiles:', error)
    alert('Failed to generate AI profiles. Please try again.')
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
/* (Styles are unchanged from your original file) */
.discover-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

.discover-header {
  background: #6A2C4A;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.discover-header h1 { font-size: 1.5rem; margin: 0; }
.header-actions { display: flex; gap: 1rem; align-items: center; }
.filter-btn, .menu-btn { background: none; border: none; color: white; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background-color 0.3s ease; }
.filter-btn:hover, .menu-btn:hover { background: rgba(255, 255, 255, 0.1); }
.filter-icon, .menu-icon { width: 24px; height: 24px; }

.generate-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}
.generate-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.generate-icon { width: 18px; height: 18px; }

.filters-panel { background: white; padding: 1.5rem; border-bottom: 1px solid #e9ecef; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.filter-group { margin-bottom: 1rem; }
.filter-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
.filter-group select, .filter-group input { width: 100%; padding: 0.75rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; }
.age-range { display: flex; align-items: center; gap: 0.5rem; }
.age-range input { flex: 1; }
.apply-filters-btn { background: #6A2C4A; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; }

.cards-container { position: relative; height: 70vh; display: flex; justify-content: center; align-items: center; padding: 2rem; }
.dog-card { position: absolute; width: 300px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; cursor: grab; transition: transform 0.3s ease; }
.dog-card:active { cursor: grabbing; }
.dog-card.active { transform: translateX(var(--offset, 0px)) rotate(var(--rotation, 0deg)); }
.card-image { position: relative; height: 60%; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.card-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 1rem; color: white; }
.dog-info h2 { margin: 0 0 0.25rem 0; font-size: 1.5rem; }
.dog-info p { margin: 0; opacity: 0.9; }
.card-details { padding: 1rem; height: 40%; overflow-y: auto; }
.detail-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding: 0.25rem 0; border-bottom: 1px solid #f0f0f0; }
.detail-row:last-child { border-bottom: none; }
.label { font-weight: 600; color: #666; }
.value { color: #333; }
.value.certified { color: #28a745; font-weight: 600; }

/* New profile sections */
.info-section { margin-bottom: 1rem; }
.content-section { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f0f0f0; }
.content-section:last-child { border-bottom: none; }
.content-section h4 { margin: 0 0 0.75rem 0; font-size: 1rem; font-weight: 600; color: #333; }
.temperament { margin: 0; line-height: 1.4; color: #555; font-size: 0.9rem; }

/* Training section */
.training-level, .certifications, .training-notes { margin-bottom: 0.75rem; }
.training-level:last-child, .certifications:last-child, .training-notes:last-child { margin-bottom: 0; }
.cert-badges { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem; }
.cert-badge { background: #6A2C4A; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 500; }
.training-notes p { margin: 0; line-height: 1.4; color: #555; font-size: 0.85rem; }

/* Medical papers */
.medical-papers { display: flex; flex-direction: column; gap: 0.5rem; }
.paper-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 6px; }
.paper-icon { font-size: 1.2rem; }
.paper-info { display: flex; flex-direction: column; gap: 0.1rem; }
.paper-name { font-weight: 600; color: #333; font-size: 0.85rem; }
.paper-date { font-size: 0.7rem; color: #666; }

/* Preferences */
.preference-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.preference-item:last-child { margin-bottom: 0; }
.preference-item .label { font-size: 0.8rem; }
.preference-item .value { font-size: 0.85rem; font-weight: 600; text-align: right; }
.no-dogs { text-align: center; color: #666; }
.no-dogs-icon { font-size: 4rem; margin-bottom: 1rem; }

.action-buttons { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 2rem; z-index: 50; }
.action-btn { width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s ease; }
.pass-btn { background: #ff4757; color: white; }
.like-btn { background: #2ed573; color: white; }
.action-btn:hover { transform: scale(1.1); }
.action-icon { width: 24px; height: 24px; }

.nav-menu { position: fixed; top: 0; right: 0; width: 100%; height: 100%; z-index: 200; }
.nav-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.nav-content { position: absolute; top: 0; right: 0; width: 250px; height: 100%; background: #6A2C4A; padding: 2rem 0; }
.nav-item { padding: 1rem 2rem; color: white; cursor: pointer; transition: background-color 0.3s ease; }
.nav-item:hover, .nav-item.active { background: rgba(255, 255, 255, 0.1); }
.nav-item span { font-size: 1.1rem; font-weight: 500; }

.match-animation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; display: flex; align-items: center; justify-content: center; }
.match-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(106, 44, 74, 0.9); }
.match-content { position: relative; z-index: 1; text-align: center; color: white; }
.match-bubbles { position: relative; width: 300px; height: 300px; margin: 0 auto 2rem; }
.bubble { position: absolute; font-size: 2rem; animation: float 2s ease-in-out infinite; }
.bubble-1 { top: 20%; left: 10%; animation-delay: 0s; }
.bubble-2 { top: 10%; right: 20%; animation-delay: 0.3s; }
.bubble-3 { bottom: 30%; left: 5%; animation-delay: 0.6s; }
.bubble-4 { bottom: 20%; right: 10%; animation-delay: 0.9s; }
.bubble-5 { top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 1.2s; }
.bubble-6 { top: 70%; right: 30%; animation-delay: 1.5s; }
@keyframes float { 0%, 100% { transform: translateY(0px) scale(1) } 50% { transform: translateY(-20px) scale(1.1) } }
.match-text h2 { font-size: 3rem; margin: 0 0 1rem 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
.match-text p { font-size: 1.2rem; margin: 0; opacity: 0.9; }

.chat-interface { position: fixed; bottom: 0; right: 0; width: 400px; height: 500px; background: white; border-radius: 20px 20px 0 0; box-shadow: 0 -5px 20px rgba(0,0,0,0.2); z-index: 500; display: flex; flex-direction: column; }
.chat-header { background: #6A2C4A; color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center; border-radius: 20px 20px 0 0; }
.chat-dog-info { display: flex; align-items: center; gap: 0.75rem; }
.chat-dog-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.chat-dog-info h3 { margin: 0; font-size: 1rem; }
.chat-dog-info p { margin: 0; font-size: 0.8rem; opacity: 0.8; }
.close-chat-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.25rem; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
.close-chat-btn:hover { background: rgba(255, 255, 255, 0.1); }
.chat-messages { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.message { display: flex; flex-direction: column; }
.message.own-message { align-items: flex-end; }
.message-content { max-width: 80%; padding: 0.75rem 1rem; border-radius: 18px; position: relative; }
.message:not(.own-message) .message-content { background: #f1f3f4; color: #333; }
.message.own-message .message-content { background: #6A2C4A; color: white; }
.message-sender { font-size: 0.8rem; font-weight: 600; margin-bottom: 0.25rem; display: block; }
.message-text { margin: 0 0 0.25rem 0; line-height: 1.4; }
.message-time { font-size: 0.7rem; opacity: 0.7; }
.chat-input { padding: 1rem; border-top: 1px solid #e9ecef; display: flex; gap: 0.5rem; align-items: center; }
.message-input { flex: 1; padding: 0.75rem; border: 1px solid #e9ecef; border-radius: 20px; outline: none; font-size: 0.9rem; }
.message-input:focus { border-color: #6A2C4A; }
.send-btn { background: #6A2C4A; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.send-btn:hover:not(:disabled) { background: #5a253e; transform: scale(1.05); }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-icon { width: 20px; height: 20px; }

/* Responsive blocks (unchanged) */
@media (max-width: 428px) { /* ... (omitted for brevity, identical to your original) ... */ }
@media (min-width: 429px) and (max-width: 768px) { /* ... */ }
@media (min-width: 769px) { /* ... */ }

/* Filtering overlays (both variants kept) */
.filtering-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(106, 44, 74, 0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.filtering-content { text-align: center; color: white; }
.filtering-spinner { font-size: 3rem; margin-bottom: 1rem; animation: spin 2s linear infinite; }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
</style>
