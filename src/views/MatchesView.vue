<!-- src/views/MatchesView.vue -->
<template>
  <div class="matches-page">
    <header class="matches-header">
      <h1>Matches</h1>
      <div class="header-actions">
        <button class="btn" @click="goDiscover">Discover</button>
        <button class="btn danger" @click="clearAll" :disabled="matches.length === 0">Clear All</button>
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
          <h2>{{ m.name }} <span v-if="m.age" class="age">• {{ m.age }}</span></h2>
          <p class="sub">{{ m.breed }} • {{ m.location }}</p>
          <p class="owner" v-if="m.ownerName">Owner: {{ m.ownerName }}</p>

          <div class="actions">
            <button class="btn" @click="goDiscover">Message</button>
            <button class="btn outline" @click="viewProfile(m)">View Profile</button>
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

// Keep the same key as DiscoverView
const MATCHES_KEY = 'demo_matches'

function loadStoredMatches() {
  try { return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]') } catch { return [] }
}
function saveStoredMatches(arr) {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(arr))
}

const router = useRouter()
const matches = ref([])

const sortedMatches = computed(() =>
  [...matches.value].sort((a, b) => (b.matchedAt || 0) - (a.matchedAt || 0))
)

function refreshFromStorage() {
  matches.value = loadStoredMatches()
}

function removeMatch(id) {
  const next = matches.value.filter(m => m.id !== id)
  matches.value = next
  saveStoredMatches(next)
}

function clearAll() {
  matches.value = []
  saveStoredMatches([])
}

function goDiscover() {
  router.push('/discover')
}

function viewProfile(m) {
  // For now, just go to Discover; later you can route to a dog detail page
  router.push('/discover')
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

function onMatchesUpdated() {
  refreshFromStorage()
}

onMounted(() => {
  refreshFromStorage()
  // 1) Custom event from DiscoverView (matches-updated)
  window.addEventListener('matches-updated', onMatchesUpdated)
  // 2) Cross-tab/localStorage change
  window.addEventListener('storage', onMatchesUpdated)
})

onBeforeUnmount(() => {
  window.removeEventListener('matches-updated', onMatchesUpdated)
  window.removeEventListener('storage', onMatchesUpdated)
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
