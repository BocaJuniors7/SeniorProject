<template>
  <div class="chat-view">
    <header class="chat-header-bar">
      <h1>Messages</h1>
      <div class="chat-as" v-if="myDogs.length">
        <label>Chat as:</label>
        <select v-model="currentDogId" @change="onDogChange">
          <option v-for="d in myDogs" :key="d.id" :value="d.id">
            {{ d.name || 'Unnamed' }}
          </option>
        </select>
      </div>
    </header>

    <div class="chat-container">
      <!-- Conversation List -->
      <div class="conversation-list">
        <div v-if="conversations.length === 0" class="empty-convos">
          No conversations yet. Like someone in Discover to start chatting!
        </div>
        
        <div
          v-for="conv in conversations"
          :key="conv.key"
          class="conversation-item"
          :class="{ active: conv.key === selectedKey }"
          @click.stop="handleConversationClick(conv)"
          @mousedown.prevent
        >
          <img :src="conv.dog.image || placeholder" class="conv-avatar" />
          <div class="conv-info">
            <div class="conv-name">{{ conv.dog.name || conv.dog.ownerName || 'Unknown' }}</div>
            <div class="conv-preview">{{ conv.lastText || 'Say hello 👋' }}</div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area" v-if="selectedConversation">
        <div class="chat-header">
          <img :src="selectedConversation.dog.image || placeholder" class="chat-avatar" />
          <div>
            <h3>{{ selectedConversation.dog.name || selectedConversation.dog.ownerName }}</h3>
            <p>{{ selectedConversation.dog.ownerName }}</p>
          </div>
        </div>

        <div class="messages-area" ref="messagesArea">
          <div v-if="messages.length === 0" class="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message"
            :class="{ 'my-message': msg.senderDogId === currentDogId }"
          >
            <div class="message-bubble">
              <p>{{ msg.text }}</p>
              <span class="message-time">{{ formatTime(msg.createdAtMs) }}</span>
            </div>
          </div>
        </div>

        <div class="message-input-area">
          <input
            v-model="messageText"
            @keyup.enter="sendMessage"
            placeholder="Type a message..."
            class="message-input"
            :disabled="!canSendMessage"
            ref="messageInputRef"
          />
          <button 
            @click="sendMessage" 
            :disabled="!messageText.trim() || !canSendMessage" 
            class="send-button"
          >
            Send
          </button>
        </div>
      </div>

      <div v-else class="chat-area empty">
        <div class="empty-message">
          <div class="empty-icon">💬</div>
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

const myDogs = ref([])
const currentDogId = ref(null)
const conversations = ref([])
const selectedKey = ref(null)
const selectedConversation = ref(null)
const threadId = ref(null)
const messages = ref([])
const messageText = ref('')
const messagesArea = ref(null)
const messageInputRef = ref(null)
const placeholder = 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&h=400&fit=crop&q=80'

// Computed to check if input should be enabled
const canSendMessage = computed(() => {
  return !!(threadId.value && currentDogId.value)
})

let unsubscribeThreads = null
let unsubscribeMessages = null

// Fetch user's dogs
async function fetchMyDogs(userUid) {
  const q = query(collection(db, 'dogs'), where('ownerId', '==', userUid))
  const snap = await getDocs(q)
  const dogs = snap.docs.map(d => {
    const data = d.data()
    const image = (Array.isArray(data.gallery) && data.gallery[0]) || data.image || placeholder
    return { id: d.id, name: data.name || 'Unnamed', image }
  })
  myDogs.value = dogs
  
  // Check route query for fromDog parameter (when navigating from MatchesView)
  const fromDog = route.query.fromDog
  if (fromDog && dogs.some(d => d.id === fromDog)) {
    currentDogId.value = fromDog
  } else if (dogs.length && !currentDogId.value) {
    currentDogId.value = dogs[0].id
  }
}

// Get dog profile
async function getDogProfile(dogId) {
  const ds = await getDoc(doc(db, 'dogs', dogId))
  if (!ds.exists()) return null
  const d = ds.data()
  const image = (Array.isArray(d.gallery) && d.gallery[0]) || d.image || placeholder
  return {
    id: ds.id,
    name: d.name || 'Unnamed',
    ownerName: d.ownerName || d.owner || '',
    image
  }
}

// Load conversations for current dog
async function loadConversations() {
  if (!currentDogId.value) {
    conversations.value = []
    return
  }
  
  // Unsubscribe from previous listener
  if (unsubscribeThreads) {
    unsubscribeThreads()
    unsubscribeThreads = null
  }
  
  // Get matches once
  const likesByUs = await getDocs(
    query(collection(db, 'likes'), where('fromDogId', '==', currentDogId.value))
  )
  const likedIds = likesByUs.docs.map(d => d.data().toDogId)
  
  const likesToUs = await getDocs(
    query(collection(db, 'likes'), where('toDogId', '==', currentDogId.value))
  )
  const theirLikes = likesToUs.docs.map(d => d.data().fromDogId)
  
  const matchedIds = likedIds.filter(id => theirLikes.includes(id))
  
  // Listen to threads in real-time
  const threadsQuery = query(
    collection(db, 'threads'),
    where('members', 'array-contains', currentDogId.value)
  )
  
  unsubscribeThreads = onSnapshot(threadsQuery, async (snap) => {
    const convs = []
    const threadMap = new Map()
    
    // Process threads
    for (const threadDoc of snap.docs) {
      const thread = threadDoc.data()
      const otherDogId = thread.members.find(id => id !== currentDogId.value)
      if (otherDogId) {
        threadMap.set(otherDogId, threadDoc.id)
        const dog = await getDogProfile(otherDogId)
        if (dog) {
          convs.push({
            key: `t:${threadDoc.id}`,
            type: 'thread',
            threadId: threadDoc.id,
            dog,
            lastText: thread.lastMessageText || 'Say hello 👋',
            lastTs: thread.lastMessageAt?.toMillis?.() || 0
          })
        }
      }
    }
    
    // Add new matches without threads
    for (const id of matchedIds) {
      if (!threadMap.has(id)) {
        const dog = await getDogProfile(id)
        if (dog) {
          convs.push({
            key: `n:${id}`,
            type: 'new',
            threadId: null,
            dog,
            lastText: 'Say hello 👋',
            lastTs: 0
          })
        }
      }
    }
    
    conversations.value = convs.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0))
    
    // If we have a selected conversation, update it
    if (selectedKey.value) {
      const updated = conversations.value.find(c => c.key === selectedKey.value)
      if (updated) {
        selectedConversation.value = updated
      }
    }
  })
}

// Handle conversation click
function handleConversationClick(conv) {
  console.log('Conversation clicked!', conv)
  selectConversation(conv)
}

// Select conversation
async function selectConversation(conv) {
  try {
    console.log('Selecting conversation:', conv)
    
    if (!conv || !conv.dog) {
      console.error('Invalid conversation:', conv)
      return
    }
    
    if (!currentDogId.value) {
      console.error('No current dog selected')
      alert('Please select a dog to chat as first')
      return
    }
    
    // Set immediately for UI feedback
    selectedKey.value = conv.key
    selectedConversation.value = conv
    
    let finalThreadId = null
    
    if (conv.type === 'new') {
      // Create thread for new match
      const otherDogId = conv.dog.id
      const membersKey = [currentDogId.value, otherDogId].sort().join('_')
      
      // Check if thread exists
      const existing = await getDocs(
        query(collection(db, 'threads'), where('membersKey', '==', membersKey))
      )
      
      if (!existing.empty) {
        finalThreadId = existing.docs[0].id
        selectedKey.value = `t:${finalThreadId}`
      } else {
        // Create new thread
        const threadRef = await addDoc(collection(db, 'threads'), {
          members: [currentDogId.value, otherDogId].sort(),
          membersKey,
          createdAt: serverTimestamp(),
          lastMessageAt: null,
          lastMessageText: '',
          lastMessageSenderDogId: null,
          lastReadAtBy: { [currentDogId.value]: serverTimestamp() }
        })
        finalThreadId = threadRef.id
        selectedKey.value = `t:${finalThreadId}`
      }
    } else {
      finalThreadId = conv.threadId
    }
    
    // Set threadId immediately so input is enabled
    threadId.value = finalThreadId
    
    console.log('Thread ID set to:', finalThreadId, 'threadId.value is now:', threadId.value)
    
    // Load messages
    loadMessages()
    
    // Mark as read
    if (finalThreadId) {
      try {
        await updateDoc(doc(db, 'threads', finalThreadId), {
          [`lastReadAtBy.${currentDogId.value}`]: serverTimestamp()
        })
      } catch (err) {
        console.error('Error marking as read:', err)
      }
    }
    
    // Force reactivity update to ensure input is enabled
    await nextTick()
    
    // Focus the input if it exists
    if (messageInputRef.value && finalThreadId) {
      messageInputRef.value.focus()
    }
    
    console.log('Conversation opened successfully. Thread ID:', finalThreadId, 'Input should be enabled:', !!threadId.value)
  } catch (error) {
    console.error('Error selecting conversation:', error)
    alert('Failed to open conversation: ' + error.message)
  }
}

// Load messages
function loadMessages() {
  if (unsubscribeMessages) {
    unsubscribeMessages()
    unsubscribeMessages = null
  }
  
  if (!threadId.value) {
    messages.value = []
    return
  }
  
  const q = query(
    collection(db, 'threads', threadId.value, 'messages'),
    orderBy('createdAt', 'asc')
  )
  
  unsubscribeMessages = onSnapshot(q, (snap) => {
    messages.value = snap.docs.map(d => {
      const m = d.data()
      return {
        id: d.id,
        text: m.text,
        senderDogId: m.senderDogId,
        createdAtMs: m.createdAt?.toMillis?.() || Date.now()
      }
    })
    scrollToBottom()
  })
}

// Send message
async function sendMessage() {
  const text = messageText.value.trim()
  if (!text || !threadId.value || !currentDogId.value) return
  
  try {
    await addDoc(collection(db, 'threads', threadId.value, 'messages'), {
      text,
      senderDogId: currentDogId.value,
      createdAt: serverTimestamp()
    })
    
    await updateDoc(doc(db, 'threads', threadId.value), {
      lastMessageText: text,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderDogId: currentDogId.value,
      [`lastReadAtBy.${currentDogId.value}`]: serverTimestamp()
    })
    
    messageText.value = ''
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Failed to send message: ' + error.message)
  }
}

// Scroll to bottom
function scrollToBottom() {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

// Format time
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Handle dog change
function onDogChange() {
  selectedKey.value = null
  selectedConversation.value = null
  threadId.value = null
  messages.value = []
  if (unsubscribeMessages) {
    unsubscribeMessages()
    unsubscribeMessages = null
  }
  loadConversations()
}

// Watch for route query params to auto-open conversation
watch(() => route.query, async (newQuery) => {
  const withDogId = newQuery.with
  const fromDogId = newQuery.fromDog
  
  if (!withDogId || !fromDogId) return
  
  // Make sure the active dog is set correctly
  if (currentDogId.value !== fromDogId && myDogs.value.some(d => d.id === fromDogId)) {
    currentDogId.value = fromDogId
    // Wait for conversations to load
    await loadConversations()
  }
  
  // Wait a bit for conversations to populate if they're still loading
  let attempts = 0
  while (conversations.value.length === 0 && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  if (currentDogId.value === fromDogId && conversations.value.length > 0) {
    // Find the conversation
    const conv = conversations.value.find(c => 
      (c.type === 'new' && c.dog.id === withDogId) ||
      (c.type === 'thread' && c.dog.id === withDogId)
    )
    
    if (conv) {
      await selectConversation(conv)
      // Clear query params
      router.replace({ path: '/messages', query: {} })
    } else {
      // If conversation not found, it might be a new match - create it
      const dog = await getDogProfile(withDogId)
      if (dog) {
        const newConv = {
          key: `n:${withDogId}`,
          type: 'new',
          threadId: null,
          dog,
          lastText: 'Say hello 👋',
          lastTs: 0
        }
        await selectConversation(newConv)
        router.replace({ path: '/messages', query: {} })
      }
    }
  }
}, { immediate: true })

// Auth
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.replace('/')
      return
    }
    await fetchMyDogs(user.uid)
    await loadConversations()
    
    // After loading, check if we need to open a conversation from route params
    const withDogId = route.query.with
    const fromDogId = route.query.fromDog
    
    if (withDogId && fromDogId && currentDogId.value === fromDogId) {
      // Wait a moment for conversations to fully load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const conv = conversations.value.find(c => 
        (c.type === 'new' && c.dog.id === withDogId) ||
        (c.type === 'thread' && c.dog.id === withDogId)
      )
      
      if (conv) {
        await selectConversation(conv)
        router.replace({ path: '/messages', query: {} })
      } else {
        // Try to create conversation for new match
        const dog = await getDogProfile(withDogId)
        if (dog) {
          const newConv = {
            key: `n:${withDogId}`,
            type: 'new',
            threadId: null,
            dog,
            lastText: 'Say hello 👋',
            lastTs: 0
          }
          await selectConversation(newConv)
          router.replace({ path: '/messages', query: {} })
        }
      }
    }
  })
})

onUnmounted(() => {
  if (unsubscribeThreads) unsubscribeThreads()
  if (unsubscribeMessages) unsubscribeMessages()
})
</script>

<style scoped>
.chat-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.chat-header-bar {
  background: #6A2C4A;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header-bar h1 {
  margin: 0;
  font-size: 1.5rem;
}

.chat-as {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-as select {
  padding: 0.5rem;
  border-radius: 4px;
  border: none;
}

.chat-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 80px);
  gap: 1rem;
  padding: 1rem;
}

.conversation-list {
  background: white;
  border-radius: 8px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
}

.empty-convos {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.conversation-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
  transition: background 0.2s;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  z-index: 1;
}

.conversation-item:hover {
  background: #f8f9fa;
}

.conversation-item:active {
  background: #e8e8e8;
  transform: scale(0.98);
}

.conversation-item.active {
  background: #e8f4f8;
  border-left: 3px solid #6A2C4A;
}

.conv-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.conv-preview {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-area {
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e9ecef;
}

.chat-area.empty {
  align-items: center;
  justify-content: center;
  color: #666;
}

.empty-message {
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-messages {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.chat-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
}

.message.my-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background: #f1f3f4;
}

.message.my-message .message-bubble {
  background: #6A2C4A;
  color: white;
}

.message-bubble p {
  margin: 0 0 0.25rem 0;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-input-area {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 0.5rem;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  outline: none;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: #6A2C4A;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

