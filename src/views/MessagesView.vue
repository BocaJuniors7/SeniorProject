<template>
  <div class="messages-page">
    <!-- Header -->
    <header class="page-header">
      <h1>Messages</h1>
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
        </header>

        <div class="chat-messages scroll">
          <div
            v-for="m in chatMessages"
            :key="m.id"
            :class="['message', { 'own-message': m.sender === 'You' }]"
          >
            <div class="message-content">
              <span class="message-sender" v-if="m.sender !== 'You'">{{ m.sender }}</span>
              <p class="message-text">{{ m.text }}</p>
              <span class="message-time">{{ formatTime(m.ts) }}</span>
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
          <button class="send-btn" :disabled="!messageInput.trim()" @click="sendChatMessage">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase' // ← change to '@/firebase' if that's your alias

const router = useRouter()

/* UI State */
const showMenu = ref(false)
const selectedConvKey = ref(null)
const messageInput = ref('')
const refreshTick = ref(0) // bump to recompute from localStorage
const placeholder = 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&h=400&fit=crop&q=80'

/* Keys shared with DiscoverView demo */
const MATCHES_KEY = 'demo_matches'
const MESSAGES_KEY = 'demo_messages'           // { [convKey]: Message[] }
const MESSAGES_META_KEY = 'demo_messages_meta' // { [convKey]: { lastReadTs:number } }

/* Helpers (localStorage) */
function loadStoredMatches() {
  try { return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]') } catch { return [] }
}
function loadAllMessages() {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}') } catch { return {} }
}
function saveAllMessages(obj) { localStorage.setItem(MESSAGES_KEY, JSON.stringify(obj)) }
function loadAllMeta() {
  try { return JSON.parse(localStorage.getItem(MESSAGES_META_KEY) || '{}') } catch { return {} }
}
function saveAllMeta(obj) { localStorage.setItem(MESSAGES_META_KEY, JSON.stringify(obj)) }

function convKeyForDog(dog) {
  const id = dog?.id ?? dog?.ownerId ?? 'unknown'
  return `dog_${id}`
}

const conversations = computed(() => {
  refreshTick.value // dependency
  const matches = loadStoredMatches()
  const allMsgs = loadAllMessages()
  const meta = loadAllMeta()

  return matches.map(dog => {
    const key = convKeyForDog(dog)
    const msgs = (allMsgs[key] || []).sort((a,b)=>a.ts-b.ts)
    const last = msgs[msgs.length - 1]
    const lastRead = meta[key]?.lastReadTs || 0
    const unread = msgs.filter(m => m.ts > lastRead && m.sender !== 'You').length
    return {
      key,
      dog,
      lastText: last ? last.text : 'Say hello 👋',
      lastTs: last ? last.ts : 0,
      unread
    }
  }).sort((a,b)=>b.lastTs - a.lastTs)
})

const selectedConversation = computed(() =>
  conversations.value.find(c => c.key === selectedConvKey.value)
)
const selectedDog = computed(() => selectedConversation.value?.dog || null)
const chatMessages = computed(() => {
  refreshTick.value // dependency
  const all = loadAllMessages()
  const arr = all[selectedConvKey.value] || []
  return arr.sort((a,b)=>a.ts-b.ts)
})

function openConversation(key) {
  selectedConvKey.value = key
  const meta = loadAllMeta()
  meta[key] = { lastReadTs: Date.now() }
  saveAllMeta(meta)
  refreshTick.value++
}

function sendChatMessage() {
  const text = messageInput.value.trim()
  if (!text || !selectedConvKey.value) return
  const all = loadAllMessages()
  const arr = all[selectedConvKey.value] || []
  arr.push({ id: Date.now(), sender: 'You', text, ts: Date.now() })
  all[selectedConvKey.value] = arr
  saveAllMessages(all)
  messageInput.value = ''
  refreshTick.value++

  // Simulated reply
  setTimeout(() => {
    const all2 = loadAllMessages()
    const arr2 = all2[selectedConvKey.value] || []
    arr2.push({
      id: Date.now()+1,
      sender: selectedDog.value?.ownerName || 'Owner',
      text: getRandomReply(),
      ts: Date.now()+1
    })
    all2[selectedConvKey.value] = arr2
    saveAllMessages(all2)
    refreshTick.value++
  }, 1000)
}

function getRandomReply() {
  const replies = [
    "That sounds great! 🐾",
    "We’re free this weekend—want to meet at a park?",
    "Cute! Do you have recent vet records?",
    "Fetch is her fave. Bring a ball!",
    "I can share more pics if you want."
  ]
  return replies[Math.floor(Math.random() * replies.length)]
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* Keep list fresh when matches are created in Discover */
function onMatchesUpdated() { refreshTick.value++ }
function onStorageChange(e) {
  if ([MATCHES_KEY, MESSAGES_KEY, MESSAGES_META_KEY].includes(e.key)) {
    refreshTick.value++
  }
}

/* ── NEW: Redirect to Home if user signs out ────────────────────────────── */
let unsubscribeAuth = null
function ensureSignedIn() {
  if (unsubscribeAuth) { unsubscribeAuth(); unsubscribeAuth = null }
  unsubscribeAuth = onAuthStateChanged(auth, (u) => {
    if (!u) {
      router.replace('/') // not signed in → bounce to Home
      return
    }
    // signed in → ensure UI is hydrated
    refreshTick.value++
  })
}
/* ──────────────────────────────────────────────────────────────────────── */

onMounted(() => {
  ensureSignedIn() // start auth watcher

  window.addEventListener('matches-updated', onMatchesUpdated)
  window.addEventListener('storage', onStorageChange)

  // open first conversation automatically (if any)
  const first = conversations.value[0]
  if (first) openConversation(first.key)
})
onUnmounted(() => {
  window.removeEventListener('matches-updated', onMatchesUpdated)
  window.removeEventListener('storage', onStorageChange)
  if (unsubscribeAuth) { unsubscribeAuth(); unsubscribeAuth = null } // cleanup
})

/* Nav + header */
const toggleMenu = () => { showMenu.value = !showMenu.value }
const goToDiscover = () => { router.push('/discover'); showMenu.value = false }
const goToProfile  = () => { router.push('/profile');  showMenu.value = false }
const goToMatches  = () => { router.push('/matches');  showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }
</script>


<style scoped>
.messages-page { min-height: 100vh; background: #f8f9fa; }

/* header (matches your style) */
.page-header {
  background: #6A2C4A; color: white; padding: 1rem 2rem;
  display: flex; justify-content: space-between; align-items: center;
  position: sticky; top: 0; z-index: 100;
}
.page-header h1 { margin: 0; font-size: 1.5rem; }
.menu-btn { background: none; border: none; color: white; cursor: pointer; padding: .5rem; border-radius: 50%; }
.menu-btn:hover { background: rgba(255,255,255,.1); }
.menu-icon { width: 24px; height: 24px; }

/* layout */
.messages-layout {
  padding: 1rem; display: grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: calc(100vh - 80px);
}

/* convo list */
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

/* chat pane */
.chat-pane { border: 1px solid #e9ecef; background: #fff; border-radius: 12px; display: flex; flex-direction: column; }
.chat-pane.empty { align-items: center; justify-content: center; color: #666; }
.chat-header.compact { background: #6A2C4A; color: white; padding: 10px 12px; border-radius: 12px 12px 0 0; }
.chat-dog-info { display: flex; align-items: center; gap: 10px; }
.chat-dog-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.chat-dog-info h3 { margin: 0; font-size: 1rem; }
.chat-dog-info p { margin: 0; font-size: .8rem; opacity: .85; }
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

/* nav menu (matches your app) */
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
</style>
