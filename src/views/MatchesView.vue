<template>
  <div class="matches-page">
    <header class="matches-header">
      <h1>Matches</h1>
      <div class="header-actions">
        <button class="btn" @click="goDiscover">Discover</button>
        <!-- Clear All removed -->
      </div>
    </header>

    <div v-if="matches.length === 0" class="empty-state">
      <div class="emoji">🐾</div>
      <h3>No matches yet</h3>
      <p>Like some dogs in Discover to see them here.</p>
      <button class="btn primary" @click="goDiscover">Go to Discover</button>
    </div>

    <div v-else class="grid">
      <div v-for="m in sortedMatches" :key="m.id" class="card">
        <div class="image-wrap">
          <img :src="m.image" :alt="m.name" />
          <!-- open confirm popup instead of immediate unmatch -->
          <button class="remove-btn" @click="openUnmatchConfirm(m)" :disabled="busyIds.has(m.id)">×</button>
        </div>

        <div class="info">
          <h2>
            {{ m.name }}
            <span v-if="m.age" class="age">• {{ m.age }}</span>
          </h2>
          <p class="sub">{{ m.breed }} • {{ m.location }}</p>
          <p class="owner" v-if="m.ownerName">Owner: {{ m.ownerName }}</p>

          <div class="actions">
            <button class="btn" @click="router.push({ name: 'messages' })">
              Message
            </button>

            <button class="btn outline" @click="viewProfile(m)">
              View Profile
            </button>

          </div>

          <div class="time" v-if="m.matchedAt">
            Matched {{ timeAgo(m.matchedAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Discover-style Profile Preview Modal -->
    <div v-if="profileOpen" class="profile-modal">
      <div class="profile-backdrop" @click="closeProfilePreview"></div>

      <div class="preview-card">
        <button class="close-x" @click="closeProfilePreview">×</button>

        <div class="card-image">
          <img :src="profileDog?.image || '/placeholder.png'" :alt="profileDog?.name || 'Dog'" />
          <div class="card-overlay">
            <div class="dog-info">
              <h2>
                {{ profileDog?.name }}
                <span v-if="profileDog?.age !== '' && profileDog?.age !== null">, {{ profileDog?.age }}</span>
              </h2>
              <p>
                {{ profileDog?.breed }}
                <span v-if="profileDog?.breed && profileDog?.location"> • </span>
                {{ profileDog?.location }}
              </p>
            </div>
          </div>
        </div>

        <div class="card-details">
          <div class="info-section">
            <div class="detail-row" v-if="profileDog?.sex">
              <span class="label">Sex:</span>
              <span class="value">{{ profileDog.sex }}</span>
            </div>
            <div class="detail-row" v-if="profileDog?.weight">
              <span class="label">Weight:</span>
              <span class="value">{{ profileDog.weight }} lbs</span>
            </div>
            <div class="detail-row" v-if="profileDog?.ownerName">
              <span class="label">Owner:</span>
              <span class="value">{{ profileDog.ownerName }}</span>
            </div>
          </div>

          <div v-if="profileDog?.temperament" class="content-section">
            <h4>About {{ profileDog.name }}</h4>
            <p class="temperament">{{ profileDog.temperament }}</p>
          </div>

          <div v-if="hasTrainingInfo(profileDog)" class="content-section">
            <h4>Training & Certifications</h4>
            <div v-if="profileDog.trainingLevel" class="training-level">
              <span class="label">Training Level:</span>
              <span class="value">{{ profileDog.trainingLevel }}</span>
            </div>
            <div v-if="profileDog.certifications && profileDog.certifications.length > 0" class="certifications">
              <span class="label">Certifications:</span>
              <div class="cert-badges">
                <span v-for="cert in profileDog.certifications" :key="cert" class="cert-badge">
                  {{ certDisplay(cert) }}
                </span>
              </div>
            </div>
            <div v-if="profileDog.trainingNotes" class="training-notes">
              <p>{{ profileDog.trainingNotes }}</p>
            </div>
          </div>

          <div v-if="profileDog?.medicalPapers && profileDog.medicalPapers.length > 0" class="content-section">
            <h4>Health Certifications</h4>
            <div class="medical-papers">
              <div v-for="(paper, index) in profileDog.medicalPapers" :key="index" class="paper-item">
                <div class="paper-icon">📄</div>
                <div class="paper-info">
                  <span class="paper-name">{{ paper.name || 'Health Certificate' }}</span>
                  <span class="paper-date">{{ paper.date || 'Date not specified' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="hasPreferences(profileDog)" class="content-section">
            <h4>Breeding Preferences</h4>
            <div v-if="profileDog.lookingFor" class="preference-item">
              <span class="label">Looking for:</span>
              <span class="value">{{ profileDog.lookingFor }}</span>
            </div>
            <div v-if="profileDog.preferredBreeds" class="preference-item">
              <span class="label">Preferred breeds:</span>
              <span class="value">{{ profileDog.preferredBreeds }}</span>
            </div>
            <div v-if="profileDog.minAgePref || profileDog.maxAgePref" class="preference-item">
              <span class="label">Age preference:</span>
              <span class="value">{{ agePreferenceDisplay(profileDog) }}</span>
            </div>
            <div v-if="profileDog.travelDistance" class="preference-item">
              <span class="label">Willing to travel:</span>
              <span class="value">{{ profileDog.travelDistance }} miles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- /Profile Preview Modal -->

    <!-- Unmatch Confirm Modal -->
    <div v-if="confirmOpen" class="confirm-modal">
      <div class="confirm-backdrop" @click="closeConfirm"></div>
      <div class="confirm-card" role="dialog" aria-modal="true">
        <h3>Unmatch</h3>
        <p>
          Are you sure you want to unmatch with
          <strong>{{ confirmTarget?.name }}</strong>?
        </p>
        <div class="confirm-actions">
          <button class="btn outline" @click="closeConfirm">Cancel</button>
          <button class="btn danger" :disabled="confirmBusy" @click="confirmUnmatch">
            <span v-if="confirmBusy">Unmatching…</span>
            <span v-else>Unmatch</span>
          </button>
        </div>
      </div>
    </div>
    <!-- /Unmatch Confirm Modal -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../lib/firebase'

const router = useRouter()
const matches = ref([])
const loading = ref(false)
const busyIds = ref(new Set()) // track per-card busy state
const currentDogId = ref(null)
const currentUser = ref(null)

/* Preview modal state */
const profileOpen = ref(false)
const profileDog = ref(null)

/* Confirm modal state */
const confirmOpen = ref(false)
const confirmTarget = ref(null)
const confirmBusy = ref(false)

/* Discover "dismissed" key so the dog can reappear after unmatch */
const DISMISSED_PREFIX = 'discover_dismissed_v1'
function dismissedKey(uid, dogId) {
  if (!uid || !dogId) return ''
  return `${DISMISSED_PREFIX}:${uid}:${dogId}`
}
function undismissFromDiscover(otherDogId) {
  // Remove otherDogId from the dismissed list for THIS currentDogId
  const k = dismissedKey(currentUser.value?.uid, currentDogId.value)
  if (!k) return
  try {
    const arr = JSON.parse(localStorage.getItem(k) || '[]')
    const next = arr.filter(id => id !== otherDogId)
    localStorage.setItem(k, JSON.stringify(next))
  } catch {}
}

/* Helpers reused from Discover */
const certDisplay = (cert) => {
  const certMap = {
    'akc': 'AKC Registered',
    'therapy': 'Therapy Dog Certified',
    'service': 'Service Dog Trained',
    'cpr': 'CPR Certified',
    'obedience': 'Obedience Trained'
  }
  return cert ? (certMap[String(cert).toLowerCase()] || cert) : ''
}
const hasTrainingInfo = (dog) =>
  !!(dog?.trainingLevel || (dog?.certifications && dog.certifications.length) || dog?.trainingNotes)
const hasPreferences = (dog) =>
  !!(dog?.lookingFor || dog?.preferredBreeds || dog?.minAgePref || dog?.maxAgePref || dog?.travelDistance)
const agePreferenceDisplay = (dog) => {
  const min = dog?.minAgePref
  const max = dog?.maxAgePref
  if (!min && !max) return 'No preference'
  if (min && max) return `${min}-${max} years`
  if (min) return `${min}+ years`
  if (max) return `Up to ${max} years`
  return 'Not specified'
}
function computeAgeYears(d) {
  if (d.age !== undefined && d.age !== null && d.age !== '') return d.age
  if (d.birthdate) {
    const years = Math.max(0, Math.floor((Date.now() - new Date(d.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000)))
    return years
  }
  return ''
}

const sortedMatches = computed(() =>
  [...matches.value].sort((a, b) => (b.matchedAt || 0) - (a.matchedAt || 0))
)

async function fetchMyDogId(userUid) {
  const q = query(collection(db, 'dogs'), where('ownerId', '==', userUid))
  const snap = await getDocs(q)
  if (!snap.empty) return snap.docs[0].id
  return null
}

async function fetchReciprocalMatches(myDogId) {
  const likesByUsSnap = await getDocs(
    query(collection(db, 'likes'), where('fromDogId', '==', myDogId))
  )
  const likedDogIds = likesByUsSnap.docs.map(d => d.data().toDogId)
  if (likedDogIds.length === 0) return []

  const likesToUsSnap = await getDocs(
    query(collection(db, 'likes'), where('toDogId', '==', myDogId))
  )
  const theirLikes = likesToUsSnap.docs.map(d => d.data().fromDogId)
  const matchedDogIds = likedDogIds.filter(id => theirLikes.includes(id))
  if (matchedDogIds.length === 0) return []

  const dogs = []
  for (const id of matchedDogIds) {
    const dogSnap = await getDoc(doc(db, 'dogs', id))
    if (dogSnap.exists()) {
      const data = dogSnap.data()

      const gallery = Array.isArray(data.gallery) ? data.gallery : []
      const image =
        gallery.length > 0 ? gallery[0] : data.image || '/placeholder.png'

      dogs.push({
        id: dogSnap.id,
        name: data.name || 'Unnamed',
        age: data.age || null,
        breed: data.breed || '',
        location: data.location || '',
        ownerName: data.ownerName || data.owner || '',
        image,
        gallery,
        matchedAt: Date.now()
      })
    } else {
      console.warn(`⚠️ Dog profile not found for ID ${id}`)
    }
  }

  if (dogs.length === 0) {
    console.log('⚠️ No reciprocal matches returned any profiles.')
  }
  return dogs
}

async function loadMatches(user) {
  loading.value = true
  try {
    const myDog = await fetchMyDogId(user.uid)
    currentDogId.value = myDog
    if (!myDog) {
      matches.value = []
      return
    }
    matches.value = await fetchReciprocalMatches(myDog)
  } catch {
    matches.value = []
  } finally {
    loading.value = false
  }
}

async function refreshMatches() {
  if (!currentUser.value) return
  await loadMatches(currentUser.value)
}

function goDiscover() {
  router.push('/discover')
}

/* OPEN PREVIEW instead of routing */
async function viewProfile(m) {
  try {
    const ds = await getDoc(doc(db, 'dogs', m.id))
    if (ds.exists()) {
      const d = ds.data()
      const image = (Array.isArray(d.gallery) && d.gallery[0]) || d.image || m.image || '/placeholder.png'
      profileDog.value = {
        id: ds.id,
        name: d.name || m.name || 'Unnamed',
        ownerName: d.ownerName || d.owner || m.ownerName || 'Owner',
        breed: d.breed || m.breed || '',
        location: d.location || m.location || '',
        age: computeAgeYears(d),
        sex: d.sex || '',
        weight: d.weight || d.weightValue || '',
        temperament: d.temperament || '',
        trainingLevel: d.trainingLevel || '',
        certifications: d.certifications || [],
        trainingNotes: d.trainingNotes || '',
        lookingFor: d.lookingFor || '',
        preferredBreeds: d.preferredBreeds || '',
        minAgePref: d.minAgePref || '',
        maxAgePref: d.maxAgePref || '',
        travelDistance: d.travelDistance || '',
        medicalPapers: d.medicalPapers || [],
        image
      }
    } else {
      profileDog.value = { ...m }
    }
    profileOpen.value = true
  } catch (e) {
    console.error('Failed to load profile:', e)
    profileDog.value = { ...m }
    profileOpen.value = true
  }
}

function closeProfilePreview() {
  profileOpen.value = false
}

/* ----- Unmatch flow: open confirm → delete like → update UI → restore to Discover ----- */
function openUnmatchConfirm(m) {
  if (busyIds.value.has(m.id)) return
  confirmTarget.value = m
  confirmOpen.value = true
}
function closeConfirm(force = false) {
  if (confirmBusy.value && !force) return
  confirmOpen.value = false
  confirmTarget.value = null
}

// replace your existing confirmUnmatch with this:
async function confirmUnmatch() {
  if (!confirmTarget.value || !currentUser.value?.uid || !currentDogId.value) return
  const m = confirmTarget.value
  confirmBusy.value = true
  busyIds.value.add(m.id)

  try {
    // Try strict query first (may require composite index)
    let likeDocIds = []
    try {
      const q1 = query(
        collection(db, 'likes'),
        where('ownerId', '==', currentUser.value.uid),
        where('fromDogId', '==', currentDogId.value),
        where('toDogId', '==', m.id)
      )
      const s1 = await getDocs(q1)
      likeDocIds = s1.docs.map(d => d.id)
    } catch (e) {
      // Fallback: two-field query + client-side filter
      const q2 = query(
        collection(db, 'likes'),
        where('ownerId', '==', currentUser.value.uid),
        where('fromDogId', '==', currentDogId.value)
      )
      const s2 = await getDocs(q2)
      likeDocIds = s2.docs.filter(d => d.data().toDogId === m.id).map(d => d.id)
    }

    // Delete any likes we found (breaks the match)
    for (const id of likeDocIds) {
      await deleteDoc(doc(db, 'likes', id))
    }

    // Update UI list
    matches.value = matches.value.filter(x => x.id !== m.id)

    // Let them reappear in Discover for THIS active dog
    undismissFromDiscover(m.id)

    // ✅ close the popup now
    confirmBusy.value = false
    closeConfirm(true) // force close even if something still marked busy
  } catch (e) {
    console.error('Failed to unmatch:', e)
    alert('Sorry, failed to unmatch. Please try again.')
    confirmBusy.value = false // re-enable buttons so user can retry
  } finally {
    busyIds.value.delete(m.id)
  }
}


function timeAgo(ts) {
  const diff = Date.now() - Number(ts)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

let unsubscribeAuth = null
function ensureSignedIn() {
  if (unsubscribeAuth) {
    unsubscribeAuth()
    unsubscribeAuth = null
  }
  unsubscribeAuth = onAuthStateChanged(auth, user => {
    if (!user) {
      router.replace('/')
      return
    }
    currentUser.value = user
    loadMatches(user)
  })
}

onMounted(() => {
  ensureSignedIn()
})
onBeforeUnmount(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth()
    unsubscribeAuth = null
  }
})
</script>

<style scoped>
.matches-page {
  min-height: 100vh;
  background: #f8f9fa;
}
.matches-header {
  background: #6A2C4A;
  color: #fff;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-actions {
  display: flex;
  gap: .5rem;
}
.btn {
  background: #fff;
  color: #6A2C4A;
  border: 2px solid #fff;
  border-radius: 999px;
  padding: .5rem .9rem;
  font-weight: 600;
  cursor: pointer;
}
.btn:hover { opacity: .9; }
.btn.primary {
  background: #6A2C4A;
  color: #fff;
  border-color: #6A2C4A;
}
.btn.danger {
  background: #ffefef;
  color: #b40000;
  border-color: #ffefef;
}
.btn.danger.outline {
  background: transparent;
  color: #b40000;
  border-color: #ffefef;
}
.btn.outline {
  background: transparent;
  color: #6A2C4A;
  border-color: #6A2C4A;
}
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}
.empty-state .emoji { font-size: 3rem; margin-bottom: .5rem; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 1100px;
  margin: 0 auto;
}
.card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}
.image-wrap {
  position: relative;
  aspect-ratio: 4/3;
  background: #f2f2f2;
}
.image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: .5rem;
  right: .5rem;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  color: #fff;
  background: rgba(0,0,0,.55);
  cursor: pointer;
}
.remove-btn:disabled { opacity: .6; cursor: not-allowed; }
.info {
  padding: .9rem;
  display: grid;
  gap: .35rem;
}
.info h2 {
  margin: 0;
  font-size: 1.1rem;
}
.age { color: #666; font-weight: 500; }
.sub { margin: 0; color: #666; font-size: .95rem; }
.owner { margin: 0; color: #7a7a7a; font-size: .9rem; }
.actions {
  display: flex;
  gap: .5rem;
  margin-top: .25rem;
}
.time {
  margin-top: .25rem;
  color: #999;
  font-size: .8rem;
}

/* === Discover-style preview modal === */
.profile-modal { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; }
.profile-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.5); }

.preview-card {
  position: relative;
  width: min(92vw, 340px);
  height: 560px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.close-x {
  position: absolute; top: .5rem; right: .5rem; z-index: 2;
  width: 32px; height: 32px; border: none; border-radius: 50%;
  background: rgba(255,255,255,.9); cursor: pointer; font-size: 20px; color: #6A2C4A;
}

.card-image { position: relative; height: 60%; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.card-overlay {
  position: absolute; inset: auto 0 0 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 1rem; color: white;
}
.dog-info h2 { margin: 0 0 .25rem 0; font-size: 1.3rem; }
.dog-info p { margin: 0; opacity: .9; }

.card-details { height: 40%; overflow-y: auto; padding: 1rem; }
.info-section { margin-bottom: 1rem; }
.detail-row {
  display: flex; justify-content: space-between;
  margin-bottom: 0.5rem; padding: 0.25rem 0;
  border-bottom: 1px solid #f0f0f0;
}
.detail-row:last-child { border-bottom: none; }
.label { font-weight: 600; color: #666; }
.value { color: #333; }

.content-section { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f0f0f0; }
.content-section:last-child { border-bottom: none; }
.content-section h4 { margin: 0 0 0.75rem 0; font-size: 1rem; font-weight: 600; color: #333; }
.temperament { margin: 0; line-height: 1.4; color: #555; font-size: 0.9rem; }

.training-level, .certifications, .training-notes { margin-bottom: 0.75rem; }
.cert-badges { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem; }
.cert-badge { background: #6A2C4A; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 500; }

/* === Unmatch confirm modal === */
.confirm-modal { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; }
.confirm-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.confirm-card {
  position: relative; z-index: 1;
  width: min(92vw, 380px);
  background: #fff; border-radius: 16px; padding: 1rem 1.1rem 1.1rem;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
.confirm-card h3 { margin: 0 0 .4rem 0; color: #6A2C4A; }
.confirm-card p { margin: 0 0 .9rem 0; color: #333; }
.confirm-actions { display: flex; justify-content: flex-end; gap: .5rem; }
</style>
