<template>
  <div class="messages-page">
    <!-- Header -->
    <header class="page-header">
      <h1>Messages</h1>

      <!-- Active-dog switcher -->
      <div class="chat-as" v-if="myDogs.length">
        <label for="chatAs">Chat as:</label>
        <select id="chatAs" v-model="currentDogId">
          <option v-for="d in myDogs" :key="d.id" :value="d.id">
            {{ d.name || 'Unnamed' }}
          </option>
        </select>
      </div>

      <button @click="toggleMenu" class="menu-btn">
        <svg class="menu-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
    </header>

    <!-- Layout -->
    <div class="messages-layout">
      <!-- Conversation list -->
      <aside class="convo-list">
        <div v-if="!conversations.length" class="convo-empty">
          No conversations yet. Like someone in Discover to start a chat.
        </div>

        <button
          v-for="c in conversations"
          :key="c.key"
          class="convo-item"
          :class="{ active: c.key === selectedConvKey }"
          @click="openConversation(c.key)"
        >
          <img :src="c.dog.image || placeholder" alt="" class="convo-avatar" />
          <div class="convo-meta">
            <div class="convo-top">
              <span class="convo-name">{{ c.dog.name }}</span>
              <span class="convo-time">
                {{ c.lastTs ? formatTime(c.lastTs) : '' }}
              </span>
            </div>
            <div class="convo-bottom">
              <span class="convo-last">{{ c.lastText }}</span>
              <span v-if="c.unread" class="badge">{{ c.unread }}</span>
            </div>
          </div>
        </button>
      </aside>

      <!-- Chat pane -->
      <section class="chat-pane" v-if="selectedDog">
        <header class="chat-header compact">
          <div class="chat-dog-info">
            <img :src="selectedDog.image || placeholder" :alt="selectedDog.name" class="chat-dog-avatar" />
            <div>
              <h3>{{ selectedDog.name }}</h3>
              <p>{{ selectedDog.ownerName }}</p>
            </div>
          </div>

          <!-- Preview button -->
          <div class="chat-actions" v-if="selectedDog">
            <button class="preview-btn" @click="openProfilePreview">Preview Profile</button>
          </div>
        </header>

        <div class="chat-messages scroll">
          <div
            v-for="m in chatMessages"
            :key="m.id"
            :class="['message', { 'own-message': m.senderDogId === currentDogId }]"
          >
            <div class="message-content">
              <span class="message-sender" v-if="m.senderDogId !== currentDogId">{{ otherDogName }}</span>
              <p class="message-text">{{ m.text }}</p>
              <span class="message-time">{{ formatTime(m.createdAtMs) }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="messageInput"
            @keyup.enter="sendChatMessage"
            placeholder="Type a message…"
            class="message-input"
          />
          <button class="send-btn" :disabled="!messageInput.trim() || !selectedThreadId" @click="sendChatMessage">
            <svg class="send-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
      </section>

      <section class="chat-pane empty" v-else>
        <div class="empty-state">Select a conversation to start messaging.</div>
      </section>
    </div>

    <!-- Navigation Menu -->
    <div v-if="showMenu" class="nav-menu">
      <div class="nav-overlay" @click="toggleMenu"></div>
      <div class="nav-content">
        <div class="nav-item" @click="goToDiscover"><span>Discover Dogs</span></div>
        <div class="nav-item" @click="goToProfile"><span>Profile</span></div>
        <div class="nav-item" @click="goToMatches"><span>Matches</span></div>
        <div class="nav-item active" @click="toggleMenu"><span>Messages</span></div>
        <div class="nav-item" @click="goToSettings"><span>Settings</span></div>
      </div>
    </div>

    <!-- Discover-style Profile Preview Modal -->
    <div v-if="profileOpen" class="profile-modal">
      <div class="profile-backdrop" @click="closeProfilePreview"></div>

      <div class="preview-card">
        <button class="close-x" @click="closeProfilePreview">×</button>

        <!-- Top image (like Discover) -->
        <div class="card-image">
          <img :src="profileDog?.image || placeholder" :alt="profileDog?.name || 'Dog'" />
          <div class="card-overlay">
            <div class="dog-info">
              <h2>{{ profileDog?.name }}<span v-if="profileDog?.age !== '' && profileDog?.age !== null">, {{ profileDog?.age }}</span></h2>
              <p>{{ profileDog?.breed }}<span v-if="profileDog?.breed && profileDog?.location"> • </span>{{ profileDog?.location }}</p>
            </div>
          </div>
        </div>

        <!-- Scrollable details (Discover layout) -->
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import {
  collection, getDocs, getDoc, addDoc, updateDoc, doc, query, where,
  orderBy, onSnapshot, serverTimestamp, writeBatch, limit
} from 'firebase/firestore'

const router = useRouter()

/* UI State */
const showMenu = ref(false)
const selectedConvKey = ref(null)          // "t:<threadId>" or "n:<otherDogId>"
const selectedThreadId = ref(null)         // actual thread id when selected
const messageInput = ref('')
const placeholder = 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&h=400&fit=crop&q=80'

/* Dogs / active dog */
const myDogs = ref([])          // [{id,name,image}]
const currentDogId = ref(null)  // active "chat as" dog id

/* Matches + threads */
const fetchedMatches = ref([])  // matched dog profiles for currentDogId (no threads yet)
const threadConvos = ref([])    // threads for currentDogId [{threadId, dog, lastText,lastTs, unread}]
const conversations = computed(() => {
  const threadItems = threadConvos.value.map(t => ({
    key: `t:${t.threadId}`,
    type: 'thread',
    dog: t.dog,
    lastText: t.lastText || 'Say hello 👋',
    lastTs: t.lastTs || 0,
    unread: t.unread || 0,
    threadId: t.threadId
  }))

  const threadDogIds = new Set(threadConvos.value.map(t => t.dog.id))
  const newItems = fetchedMatches.value
    .filter(d => !threadDogIds.has(d.id))
    .map(d => ({
      key: `n:${d.id}`,
      type: 'new',
      dog: d,
      lastText: 'Say hello 👋',
      lastTs: d.matchedAt || 0,
      unread: 0,
      threadId: null
    }))

  return [...threadItems, ...newItems].sort((a,b)=> (b.lastTs||0) - (a.lastTs||0))
})

/* Selected chat state */
const selectedConversation = computed(() =>
  conversations.value.find(c => c.key === selectedConvKey.value)
)
const selectedDog = computed(() => selectedConversation.value?.dog || null)
const otherDogName = computed(() => selectedDog.value?.ownerName || 'Owner')

/* Message stream */
const chatMessages = ref([]) // [{id, text, senderDogId, createdAtMs}]

/* Caches */
const dogCache = new Map()

// ----- Helpers: Dogs & Matches -----
async function fetchMyDogs(userUid) {
  const q = query(collection(db, 'dogs'), where('ownerId', '==', userUid))
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    const gallery = Array.isArray(data.gallery) ? data.gallery : []
    const image = gallery[0] || data.image || '/placeholder.png'
    return { id: d.id, name: data.name || 'Unnamed', image }
  })
}

function firstPhotoUrl(d) {
  if (Array.isArray(d?.gallery) && d.gallery.length) return d.gallery[0]
  if (Array.isArray(d?.photos) && d.photos.length) {
    const p0 = d.photos[0]
    if (typeof p0 === 'string') return p0
    if (p0 && typeof p0 === 'object' && 'url' in p0) return p0.url || ''
  }
  return ''
}
function normalizePhotoArray(d) {
  if (Array.isArray(d?.gallery) && d.gallery.length) return d.gallery.slice()
  if (Array.isArray(d?.photos) && d.photos.length) {
    return d.photos.map(p => (typeof p === 'string' ? p : (p && p.url) || '')).filter(Boolean)
  }
  return []
}

async function getDogProfile(dogId) {
  if (dogCache.has(dogId)) return dogCache.get(dogId)
  const ds = await getDoc(doc(db, 'dogs', dogId))
  if (!ds.exists()) return null
  const dd = ds.data()
  const gallery = Array.isArray(dd.gallery) ? dd.gallery : []
  const image = gallery[0] || dd.image || '/placeholder.png'
  const prof = {
    id: ds.id,
    name: dd.name || 'Unnamed',
    ownerName: dd.ownerName || dd.owner || '',
    breed: dd.breed || '',
    location: dd.location || '',
    image,
    age: dd.age ?? null,
    gallery
  }
  dogCache.set(dogId, prof)
  return prof
}

async function fetchReciprocalMatches(myDogId) {
  if (!myDogId) return []

  const byUsSnap = await getDocs(
    query(collection(db, 'likes'), where('fromDogId', '==', myDogId))
  )
  const likedDogIds = byUsSnap.docs.map(d => d.data().toDogId)
  if (likedDogIds.length === 0) return []

  const toUsSnap = await getDocs(
    query(collection(db, 'likes'), where('toDogId', '==', myDogId))
  )
  const theirLikes = toUsSnap.docs.map(d => d.data().fromDogId)

  const matchedDogIds = likedDogIds.filter(id => theirLikes.includes(id))
  const out = []
  for (const id of matchedDogIds) {
    const prof = await getDogProfile(id)
    if (prof) out.push({ ...prof, matchedAt: Date.now() })
  }
  return out
}

// ----- Threads (listening) -----
let unsubscribeThreads = null
function subscribeThreadsForDog(myDogId) {
  if (unsubscribeThreads) { unsubscribeThreads(); unsubscribeThreads = null }
  threadConvos.value = []
  if (!myDogId) return

  const qThreads = query(
    collection(db, 'threads'),
    where('members', 'array-contains', myDogId),
  )

  unsubscribeThreads = onSnapshot(qThreads, async (snap) => {
    const items = []
    for (const docSnap of snap.docs) {
      const t = docSnap.data()
      const threadId = docSnap.id
      const otherDogId = otherMemberId(t.members, myDogId)
      if (!otherDogId) continue

      // 🔒 Auto-delete the thread if the match is broken
      // (best-effort; ignores errors silently)
      try {
        const deleted = await purgeIfUnmatched(threadId, myDogId, otherDogId)
        if (deleted) continue // skip rendering this thread
      } catch {}

      const otherDog = await getDogProfile(otherDogId)
      const lastTs = t.lastMessageAt?.toMillis ? t.lastMessageAt.toMillis() : 0
      const lastText = t.lastMessageText || ''
      const lastReadTs = t.lastReadAtBy?.[myDogId]?.toMillis?.() || 0
      const unread = lastTs && lastTs > lastReadTs ? 1 : 0

      if (otherDog) items.push({ threadId, dog: otherDog, lastText, lastTs, unread })
    }
    items.sort((a,b)=> (b.lastTs||0) - (a.lastTs||0))
    threadConvos.value = items
  })
}


// ----- Messages (listening) -----
let unsubscribeMessages = null
function subscribeMessages(threadId) {
  if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages = null }
  chatMessages.value = []
  if (!threadId) return
  const qMsgs = query(
    collection(db, 'threads', threadId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  unsubscribeMessages = onSnapshot(qMsgs, (snap) => {
    const arr = []
    snap.forEach(d => {
      const m = d.data()
      arr.push({
        id: d.id,
        text: m.text,
        senderDogId: m.senderDogId,
        createdAtMs: m.createdAt?.toMillis ? m.createdAt.toMillis() : Date.now()
      })
    })
    chatMessages.value = arr
  })
}

// ----- Thread creation / open / read -----
async function ensureThread(otherDogId) {
  const a = currentDogId.value
  const b = otherDogId
  const membersKey = [a, b].sort().join('_')

  const q1 = query(collection(db, 'threads'), where('membersKey', '==', membersKey))
  const s1 = await getDocs(q1)
  if (!s1.empty) return s1.docs[0].id

  const q2 = query(collection(db, 'threads'), where('members', 'array-contains', a))
  const s2 = await getDocs(q2)
  const hit = s2.docs.find(d => {
    const m = d.data().members || []
    return m.includes(a) && m.includes(b)
  })
  if (hit) return hit.id

  const docRef = await addDoc(collection(db, 'threads'), {
    members: [a, b].sort(),
    membersKey,
    createdAt: serverTimestamp(),
    lastMessageAt: null,
    lastMessageText: '',
    lastMessageSenderDogId: null,
    lastReadAtBy: { [a]: serverTimestamp() }
  })
  return docRef.id
}

async function markThreadRead(threadId) {
  if (!threadId || !currentDogId.value) return
  await updateDoc(doc(db, 'threads', threadId), {
    [`lastReadAtBy.${currentDogId.value}`]: serverTimestamp()
  })
}

async function openConversation(key) {
  const item = conversations.value.find(c => c.key === key)
  if (!item) return

  // Resolve threadId (create if “new”)
  if (item.type === 'new') {
    const tid = await ensureThread(item.dog.id)
    selectedConvKey.value = `t:${tid}`
    selectedThreadId.value = tid
  } else {
    selectedConvKey.value = key
    selectedThreadId.value = item.threadId
  }

  // 🔒 Guard: if the match is gone, purge now and bail
  try {
    const myId = currentDogId.value
    const otherId = item.dog.id
    const tid = selectedThreadId.value
    if (myId && otherId && tid) {
      const deleted = await purgeIfUnmatched(tid, myId, otherId)
      if (deleted) return
    }
  } catch {}

  // Normal flow
  subscribeMessages(selectedThreadId.value)
  await markThreadRead(selectedThreadId.value)
}


// ----- Sending -----
async function sendChatMessage() {
  const text = messageInput.value.trim()
  if (!text || !selectedThreadId.value || !currentDogId.value) return

  await addDoc(collection(db, 'threads', selectedThreadId.value, 'messages'), {
    text,
    senderDogId: currentDogId.value,
    createdAt: serverTimestamp()
  })

  await updateDoc(doc(db, 'threads', selectedThreadId.value), {
    lastMessageText: text,
    lastMessageAt: serverTimestamp(),
    lastMessageSenderDogId: currentDogId.value,
    [`lastReadAtBy.${currentDogId.value}`]: serverTimestamp()
  })

  messageInput.value = ''
}

// ----- Profile preview (Discover-style) -----
const profileOpen = ref(false)
const profileDog = ref(null)

function computeAgeYears(d) {
  if (d.age !== undefined && d.age !== null && d.age !== '') return d.age
  if (d.birthdate) {
    const years = Math.max(0, Math.floor((Date.now() - new Date(d.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000)))
    return years
  }
  return ''
}
async function openProfilePreview() {
  if (!selectedDog.value) return
  const ds = await getDoc(doc(db, 'dogs', selectedDog.value.id))
  if (ds.exists()) {
    const d = ds.data()
    const photos = normalizePhotoArray(d)
    const image = firstPhotoUrl(d) || selectedDog.value.image || '/placeholder.png'
    profileDog.value = {
      id: ds.id,
      name: d.name || 'Unnamed',
      ownerName: d.ownerName || d.owner || 'Owner',
      breed: d.breed || '',
      location: d.location || '',
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
      photos,
      image
    }
  } else {
    profileDog.value = { ...selectedDog.value, photos: selectedDog.value.gallery || [] }
  }
  profileOpen.value = true
}
function closeProfilePreview() { profileOpen.value = false }


/* Helpers reused from Discover layout */
/** Check if two dogs are still matched (reciprocal like exists). */
function otherMemberId(members = [], myDogId) {
  return (members || []).find(id => id !== myDogId) || null
}

async function areDogsStillMatched(dogAId, dogBId) {
  // dogA → dogB
  const s1 = await getDocs(
    query(collection(db, 'likes'),
      where('fromDogId', '==', dogAId),
      where('toDogId', '==', dogBId),
      limit(1)
    )
  )
  if (s1.empty) return false

  // dogB → dogA
  const s2 = await getDocs(
    query(collection(db, 'likes'),
      where('fromDogId', '==', dogBId),
      where('toDogId', '==', dogAId),
      limit(1)
    )
  )
  return !s2.empty
}

/** Find the threadId for a pair, if it exists. */
async function findThreadIdForPair(dogAId, dogBId) {
  const membersKey = [dogAId, dogBId].sort().join('_')
  const s = await getDocs(
    query(collection(db, 'threads'), where('membersKey', '==', membersKey), limit(1))
  )
  return s.empty ? null : s.docs[0].id
}

/** Delete all messages in a thread, then delete the thread doc itself. */
async function deleteThreadAndMessages(threadId) {
  if (!threadId) return
  // Batch delete messages (in chunks if needed)
  while (true) {
    const msgsSnap = await getDocs(
      query(collection(db, 'threads', threadId, 'messages'), limit(200))
    )
    if (msgsSnap.empty) break
    const batch = writeBatch(db)
    msgsSnap.forEach(d => batch.delete(d.ref))
    await batch.commit()
  }
  // Finally delete the thread doc
  await updateDoc(doc(db, 'threads', threadId), { lastMessageText: '' }).catch(()=>{})
  await import('firebase/firestore').then(m => m.deleteDoc(doc(db, 'threads', threadId)))
}

/** Ensure a thread still has a match; if not, purge it and return true if deleted. */
async function purgeIfUnmatched(threadId, myDogId, otherDogId) {
  const stillMatched = await areDogsStillMatched(myDogId, otherDogId)
  if (stillMatched) return false
  await deleteThreadAndMessages(threadId)
  // If you currently have this thread open, clear the pane
  if (selectedThreadId.value === threadId) {
    selectedThreadId.value = null
    selectedConvKey.value = null
    chatMessages.value = []
  }
  return true
}


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

// ----- Auth + initial hydrate -----
let unsubscribeAuth = null
function ensureSignedIn() {
  if (unsubscribeAuth) { unsubscribeAuth(); unsubscribeAuth = null }
  unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
    if (!u) {
      router.replace('/')
      return
    }
    myDogs.value = await fetchMyDogs(u.uid)
    if (!currentDogId.value && myDogs.value.length) {
      currentDogId.value = myDogs.value[0].id
    }
  })
}

// When active dog changes: (re)load matches and subscribe to threads
watch(currentDogId, async (n) => {
  selectedConvKey.value = null
  selectedThreadId.value = null
  if (!n) return
  fetchedMatches.value = await fetchReciprocalMatches(n)
  subscribeThreadsForDog(n)
})

onMounted(() => { ensureSignedIn() })
onUnmounted(() => {
  if (unsubscribeAuth) { unsubscribeAuth(); unsubscribeAuth = null }
  if (unsubscribeThreads) { unsubscribeThreads(); unsubscribeThreads = null }
  if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages = null }
})

/* Nav + header */
const toggleMenu = () => { showMenu.value = !showMenu.value }
const goToDiscover = () => { router.push('/discover'); showMenu.value = false }
const goToProfile  = () => { router.push('/profile');  showMenu.value = false }
const goToMatches  = () => { router.push('/matches');  showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }

/* Utils */
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
/* your original styles… */
.messages-page { min-height: 100vh; background: #f8f9fa; }
.page-header {
  background: #6A2C4A; color: white; padding: 1rem 2rem;
  display: flex; justify-content: space-between; align-items: center;
  position: sticky; top: 0; z-index: 100;
}
.page-header h1 { margin: 0; font-size: 1.5rem; }
.menu-btn { background: none; border: none; color: white; cursor: pointer; padding: .5rem; border-radius: 50%; }
.menu-btn:hover { background: rgba(255,255,255,.1); }
.menu-icon { width: 24px; height: 24px; }

.chat-as { display: flex; align-items: center; gap: .5rem; }
.chat-as select {
  border-radius: 999px; padding: .35rem .6rem; border: 1px solid #e9ecef; color: #333;
}

.messages-layout {
  padding: 1rem; display: grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: calc(100vh - 80px);
}
.convo-list { border: 1px solid #e9ecef; background: #fff; border-radius: 12px; overflow: hidden; }
.convo-empty { padding: 1rem; color: #666; }
.convo-item {
  width: 100%; background: #fff; border: none; border-bottom: 1px solid #f1f3f4;
  display: grid; grid-template-columns: 56px 1fr; gap: 10px; padding: 10px 12px;
  cursor: pointer; text-align: left;
}
.convo-item:last-child { border-bottom: none; }
.convo-item.active { background: #f8f9fa; }
.convo-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.convo-meta { display: flex; flex-direction: column; gap: 4px; }
.convo-top { display: flex; justify-content: space-between; align-items: center; }
.convo-name { font-weight: 700; color: #333; }
.convo-time { font-size: .8rem; color: #888; }
.convo-bottom { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.convo-last { font-size: .9rem; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.badge { background: #6A2C4A; color:#fff; border-radius: 999px; padding: 2px 8px; font-size: .75rem; font-weight: 700; }

.chat-pane { border: 1px solid #e9ecef; background: #fff; border-radius: 12px; display: flex; flex-direction: column; }
.chat-pane.empty { align-items: center; justify-content: center; color: #666; }

/* header with preview button */
.chat-header.compact {
  background: #6A2C4A; color: white; padding: 10px 12px; border-radius: 12px 12px 0 0;
  display: flex; align-items: center; justify-content: space-between;
}
.chat-dog-info { display: flex; align-items: center; gap: 10px; }
.chat-dog-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.chat-dog-info h3 { margin: 0; font-size: 1rem; }
.chat-dog-info p { margin: 0; font-size: .8rem; opacity: .85; }

.chat-actions { display: flex; align-items: center; }
.preview-btn {
  background: transparent; color: #fff; border: 1px solid #fff;
  padding: .35rem .6rem; border-radius: 999px; cursor: pointer;
}
.preview-btn:hover { background: rgba(255,255,255,.12); }

.chat-messages.scroll { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.message { display: flex; flex-direction: column; }
.message.own-message { align-items: flex-end; }
.message-content { max-width: 80%; padding: .6rem .9rem; border-radius: 18px; background: #f1f3f4; color: #333; }
.message.own-message .message-content { background: #6A2C4A; color: #fff; }
.message-sender { font-size: .8rem; font-weight: 600; margin-bottom: .25rem; display: block; }
.message-text { margin: 0 0 .25rem 0; line-height: 1.4; }
.message-time { font-size: .7rem; opacity: .75; }
.chat-input { padding: 10px; border-top: 1px solid #e9ecef; display: flex; gap: 8px; align-items: center; }
.message-input { flex: 1; padding: .7rem; border: 1px solid #e9ecef; border-radius: 20px; outline: none; font-size: .95rem; }
.message-input:focus { border-color: #6A2C4A; }
.send-btn {
  background: #6A2C4A; color: white; border: none; border-radius: 50%; width: 40px; height: 40px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .15s ease;
}
.send-btn:disabled { opacity: .5; cursor: not-allowed; }
.send-btn:hover:not(:disabled) { transform: scale(1.05); }
.send-icon { width: 20px; height: 20px; }

.nav-menu { position: fixed; top: 0; right: 0; width: 100%; height: 100%; z-index: 200; }
.nav-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
.nav-content { position: absolute; top: 0; right: 0; width: 250px; height: 100%; background: #6A2C4A; padding: 2rem 0; }
.nav-item { padding: 1rem 2rem; color: white; cursor: pointer; transition: background-color .3s ease; }
.nav-item:hover, .nav-item.active { background: rgba(255,255,255,.1); }

@media (max-width: 900px) {
  .messages-layout { grid-template-columns: 1fr; }
  .convo-list { max-height: 300px; overflow-y: auto; }
  .page-header { padding: 1rem; }
}

/* === Discover-style preview modal === */
.profile-modal { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; }
.profile-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.5); }

/* Card container mirrors Discover proportions */
.preview-card {
  position: relative;
  width: min(92vw, 340px);
  height: 560px; /* similar to Discover 300x500, a bit taller for content */
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

/* close button */
.close-x {
  position: absolute; top: .5rem; right: .5rem; z-index: 2;
  width: 32px; height: 32px; border: none; border-radius: 50%;
  background: rgba(255,255,255,.9); cursor: pointer; font-size: 20px; color: #6A2C4A;
}

/* Top image (60%) */
.card-image { position: relative; height: 60%; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.card-overlay {
  position: absolute; inset: auto 0 0 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 1rem; color: white;
}
.dog-info h2 { margin: 0 0 .25rem 0; font-size: 1.3rem; }
.dog-info p { margin: 0; opacity: .9; }

/* Details (40%) scrollable */
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

.medical-papers { display: flex; flex-direction: column; gap: 0.5rem; }
.paper-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 6px; }
.paper-info { display: flex; flex-direction: column; gap: 0.1rem; }
.paper-name { font-weight: 600; color: #333; font-size: 0.85rem; }
.paper-date { font-size: 0.7rem; color: #666; }

.preference-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.preference-item .label { font-size: 0.8rem; }
.preference-item .value { font-size: 0.85rem; font-weight: 600; text-align: right; }



/* actions */
.profile-actions { display: flex; justify-content: flex-end; gap: .5rem; }
.preview-close {
  background: #6A2C4A; color: #fff; border: none; border-radius: 999px; padding: .45rem .8rem; cursor: pointer;
}
.preview-close:hover { opacity: .9; }
</style>
