<template>
  <div class="matches-page">
    <header class="matches-header">
      <h1>Matches</h1>
      <div class="header-actions">
        <button class="btn" @click="goDiscover">Discover</button>
        <button class="btn outline" @click="refreshMatches" :disabled="loading">
          <span v-if="loading">Refreshing...</span>
          <span v-else>Refresh</span>
        </button>
        <button
          class="btn danger"
          @click="clearAll"
          :disabled="matches.length === 0"
        >
          Clear All
        </button>
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
          <button class="remove-btn" @click="removeMatch(m.id)">×</button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../lib/firebase'

const router = useRouter()
const matches = ref([])
const loading = ref(false)
const currentDogId = ref(null)
const currentUser = ref(null)

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

function removeMatch(id) {
  matches.value = matches.value.filter(m => m.id !== id)
}
function clearAll() {
  matches.value = []
}
function goDiscover() {
  router.push('/discover')
}
function viewProfile(m) {
  router.push({ name: 'dog-profile', params: { id: m.id } })
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
</style>