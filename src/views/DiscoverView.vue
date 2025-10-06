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

        <div class="header-actions">
          <!-- NEW: Active dog selector -->
          <div class="active-dog-select" v-if="myDogs.length">
            <label for="activeDog" class="sr-only">Choose your dog</label>
            <select id="activeDog" v-model="activeDogId" class="dog-select">
              <option v-for="d in myDogs" :key="d.id" :value="d.id">
                {{ d.name || 'Unnamed' }}
              </option>
            </select>
          </div>

          <button @click="toggleFilters" class="filter-btn">
            <svg class="filter-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 17h18v-2H3v2zm0-5h18V7H3v5zm0-7v2h18V5H3z"/>
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

      <!-- Chat Interface (demo) -->
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
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue' // >>> added watch
import { useRouter } from 'vue-router'
import { listDogs } from '../services/dogs'
import { createLike, createPass } from '../services/likes'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
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
  minAge: '',
  maxAge: '',
  distance: '25'
})

/* ---------------- My dogs + active dog selector ---------------- */
const myDogs = ref([])          // [{id, name, image}]
const activeDogId = ref('')     // id of the dog that will be used as fromDogId
const activeDog = computed(() => myDogs.value.find(d => d.id === activeDogId.value) || null)

async function fetchMyDogs() {
  if (!currentUser.value?.uid) return
  const q = query(collection(db, 'dogs'), where('ownerId', '==', currentUser.value.uid))
  const snap = await getDocs(q)
  myDogs.value = snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name || 'Unnamed',
      image: Array.isArray(data.gallery) && data.gallery.length ? data.gallery[0] :
             Array.isArray(data.photos) && data.photos.length ? (typeof data.photos[0] === 'string' ? data.photos[0] : data.photos[0]?.url || '') : ''
    }
  })
  // Default to first dog if none selected
  if (!activeDogId.value && myDogs.value.length) activeDogId.value = myDogs.value[0].id
}

/* ---------------- Per-dog dismissed/progress (local) ---------------- */
// >>> NEW: keep independent progress per (user, activeDogId)
const DISMISSED_PREFIX = 'discover_dismissed_v1'

function dismissedKey() {
  if (!currentUser.value?.uid || !activeDogId.value) return ''
  return `${DISMISSED_PREFIX}:${currentUser.value.uid}:${activeDogId.value}`
}
function loadDismissed() {
  const k = dismissedKey()
  if (!k) return []
  try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] }
}
function saveDismissed(arr) {
  const k = dismissedKey()
  if (!k) return
  localStorage.setItem(k, JSON.stringify(arr))
}
function markDismissed(dogId) {
  if (!dogId) return
  const arr = loadDismissed()
  if (!arr.includes(dogId)) {
    arr.push(dogId)
    saveDismissed(arr)
  }
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
  const qRef = query(collection(db, 'dogs'), where('ownerId', '==', u.uid), limit(1))
  const snap = await getDocs(qRef)
  hasProfile.value = !snap.empty
  checkingProfile.value = false

  if (hasProfile.value) {
    await fetchMyDogs()
  }
  return hasProfile.value
}

let offAuth = null
onMounted(async () => {
  const ok = await ensureProfileExists()
  if (ok) await loadDogs()

  // React only to sign-out after mount
  offAuth = onAuthStateChanged(auth, (u) => {
    if (!u) router.replace('/')
  })
})

onUnmounted(() => {
  if (offAuth) { offAuth(); offAuth = null }
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

// ---------- Load & Filter ----------

// todo
// load profiles in chunks from firebase queue
// implement python script for ML queue sorting
//    done periodically outside of user session
//    maybe each night or each couple nights if made into automation
//    likely behind paywall since itll be quite resource intensive if ALL users have it run
//    for demo it will be free
// toggle for default "random" or "ML sorted" queue
// move geocoding from discover to profileview save
//    if location stored is different from location being saved
//    or if coords are missing
//        use geocoding to get coords and store in profile
//    otherwise skip geocoding
//    check for this in filter for distance

// matching logic
// render profile from queue
//
// need load to use either our random or ml queue
//
// if we like that profile
//    if they like our dog
//       play match animation
//       start message conversation
//    else
//       add their profile id to our list of likes
// if skip
//    add profile id to our list of skips
// render next profile from queue

async function loadDogs() {
  isFiltering.value = true
  try {
    const docs = await listDogs({ onlyWithPhotos: false, max: 50, breed: filters.breed || undefined })
    // >>> filter out already dismissed for the current active dog
    const dismissed = new Set(loadDismissed())
    const base = excludeMyDogs(docs.map(mapDogDocToCard))
    dogs.value = base.filter(d => !dismissed.has(d.id))
  } catch (e) {
    console.error(e)
    filterError.value = 'Failed to load dogs'
  } finally {
    isFiltering.value = false
  }
}

const applyFilters = async () => {
  isFiltering.value = true
  const base = await listDogs({
    breed: filters.breed || undefined,
    onlyWithPhotos: false,
    max: 60
  })
  let filteredDogs = excludeMyDogs(base.map(mapDogDocToCard))

  try {
    if (filters.breed) {
      const b = filters.breed.toLowerCase()
      filteredDogs = filteredDogs.filter(dog => dog.breed?.toLowerCase() === b)
    }
    if (filters.minAge) filteredDogs = filteredDogs.filter(dog => Number(dog.age) >= Number(filters.minAge))
    if (filters.maxAge) filteredDogs = filteredDogs.filter(dog => Number(dog.age) <= Number(filters.maxAge))

    if (filters.distance) {
      const maxDistance = Number(filters.distance)
      const userLocation = await geocodeAddress('Lakeland, FL') // TODO: real user location
      if (!userLocation) throw new Error("Couldn't determine user's location")

      const out = []
      for (const dog of filteredDogs) {
        let dogLoc = dog.coords
        if (!(dogLoc && dogLoc.lat && dogLoc.lng) && dog.location) {
          dogLoc = await geocodeAddress(dog.location)
          await new Promise(r => setTimeout(r, 1000))
        }
        if (!dogLoc) continue
        const dist = calculateDistance(userLocation, dogLoc)
        if (dist <= maxDistance) out.push({ ...dog, distanceFromUser: dist })
      }
      filteredDogs = out
    }

    // >>> filter out cards dismissed for current active dog
    const dismissed = new Set(loadDismissed())
    filteredDogs = filteredDogs.filter(d => !dismissed.has(d.id))

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

/* ---------------- Deck actions ---------------- */
const passDog = async () => {

  if (dogs.value.length === 0) return
  const passedDog = dogs.value.shift()
  if (d) markDismissed(d.id) // >>> remember the dismissal for this active dog
  
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

/* ---------------- Matches (local demo) ---------------- */
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

/* ---------------- Like / Match ---------------- */
const likeDog = async () => {
  if (dogs.value.length === 0) return
  if (!activeDogId.value) {
    alert('Choose which of your dogs is liking first.')
    return
  }

  const likedDog = dogs.value.shift()
  if (likedDog) markDismissed(likedDog.id) // >>> mark as handled in this deck

  try {
    // include the activeDogId as fromDogId
    await createLike({
      toDogId: likedDog.id,
      toDogOwnerId: likedDog.ownerId,
      fromDogId: activeDogId.value
    })
  } catch (e) {
    console.error('Like failed:', e)
  }

  // demo match logic (unchanged)
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

// update from hardcoded to checking db for match
const checkForMatch = (dog) => {
  // demo logic; replace with real server-side matching later
  const tangoBreed = 'Golden Retriever'
  const tangoSex = 'male'
  const tangoAge = 3
  return dog.breed.toLowerCase() === tangoBreed.toLowerCase() &&
         dog.sex.toLowerCase() !== tangoSex &&
         Math.abs(Number(dog.age) - tangoAge) <= 1
}

/* ---------------- React when switching active dog ---------------- */
// >>> When the user selects a different of their dogs, reload the deck for that dog
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

/* ---------------- Chat (demo) ---------------- */
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  chatMessages.value.push({ id: Date.now(), sender: 'You', message: newMessage.value, timestamp: new Date() })
  newMessage.value = ''
  setTimeout(() => {
    chatMessages.value.push({ id: Date.now() + 1, sender: matchedDog.value.ownerName, message: getRandomResponse(), timestamp: new Date() })
  }, 2000)
}

const closeChat = () => { showChat.value = false; matchedDog.value = null; chatMessages.value = [] }
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
/* NOTE: DO NOT put the [v-cloak] rule here (scoped). It must be global. */

.discover-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

/* Header + Active dog selector */
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
.header-actions { display: flex; gap: 0.75rem; align-items: center; }

.active-dog-select { display: flex; align-items: center; }
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
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

.filter-btn { background: none; border: none; color: white; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background-color 0.3s ease; }
.filter-btn:hover { background: rgba(255, 255, 255, 0.1); }
.filter-icon { width: 24px; height: 24px; }

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

.preference-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.preference-item .label { font-size: 0.8rem; }
.preference-item .value { font-size: 0.85rem; font-weight: 600; text-align: right; }

.no-dogs { text-align: center; color: #666; }
.no-dogs-icon { font-size: 4rem; margin-bottom: 1rem; }

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

.match-animation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; display: flex; align-items: center; justify-content: center; }
.match-overlay { position: absolute; inset: 0; background: rgba(106, 44, 74, 0.9); }
.match-content { position: relative; z-index: 1; text-align: center; color: white; }
.bubble { position: absolute; font-size: 2rem; animation: float 2s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0px) scale(1) } 50% { transform: translateY(-20px) scale(1.1) } }
.chat-interface { position: fixed; bottom: 0; right: 0; width: 400px; height: 500px; background: white; border-radius: 20px 20px 0 0; box-shadow: 0 -5px 20px rgba(0,0,0,0.2); z-index: 500; display: flex; flex-direction: column; }
</style>
