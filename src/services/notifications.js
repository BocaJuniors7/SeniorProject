// src/services/notifications.js
import { ref, computed } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore'

// Global notification state
const unreadMessages = ref(0)
const newMatches = ref(0)
const notificationListeners = []
const seenMatches = ref(new Set()) // Track matches we've already notified about

// Computed total notifications
const totalNotifications = computed(() => unreadMessages.value + newMatches.value)

/**
 * Get all dog IDs owned by the current user
 */
async function getUserDogIds(userUid) {
  const q = query(collection(db, 'dogs'), where('ownerId', '==', userUid))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.id)
}

/**
 * Check if a like creates a new match (reciprocal like)
 */
async function checkForNewMatch(myDogId, otherDogId) {
  // Check if we already liked them
  const ourLikeSnap = await getDocs(
    query(
      collection(db, 'likes'),
      where('fromDogId', '==', myDogId),
      where('toDogId', '==', otherDogId)
    )
  )
  if (ourLikeSnap.empty) return false

  // Check if they just liked us back
  const theirLikeSnap = await getDocs(
    query(
      collection(db, 'likes'),
      where('fromDogId', '==', otherDogId),
      where('toDogId', '==', myDogId)
    )
  )
  return !theirLikeSnap.empty
}

/**
 * Initialize notification listeners for a user
 */
export function initNotifications(userUid) {
  // Clear existing listeners
  notificationListeners.forEach(unsub => unsub())
  notificationListeners.length = 0
  unreadMessages.value = 0
  newMatches.value = 0
  seenMatches.value.clear()

  if (!userUid) return

  // Get user's dogs
  getUserDogIds(userUid).then(async (dogIds) => {
    if (dogIds.length === 0) return

    // Listen to threads for unread messages across all dogs
    // Use array-contains-any (limit 10) or individual queries per dog
    if (dogIds.length <= 10) {
      // Simple case: use array-contains-any
      const threadsQuery = query(
        collection(db, 'threads'),
        where('members', 'array-contains-any', dogIds)
      )

      const unsubThreads = onSnapshot(threadsQuery, async (snap) => {
        let totalUnread = 0

        for (const threadDoc of snap.docs) {
          const thread = threadDoc.data()
          const members = thread.members || []
          
          // Find which of our dogs is in this thread
          const ourDogId = members.find(id => dogIds.includes(id))
          if (!ourDogId) continue

          const lastReadTs = thread.lastReadAtBy?.[ourDogId]?.toMillis?.() || 0
          const lastMessageTs = thread.lastMessageAt?.toMillis?.() || 0

          // Only count as unread if:
          // 1. There's a last message
          // 2. The last message is newer than when we last read
          // 3. We didn't send the last message
          if (
            lastMessageTs > 0 &&
            lastMessageTs > lastReadTs &&
            thread.lastMessageSenderDogId !== ourDogId
          ) {
            totalUnread++
          }
        }

        unreadMessages.value = totalUnread
      })

      notificationListeners.push(unsubThreads)
    } else {
      // For users with >10 dogs, listen to each dog individually
      const seenThreads = new Set()
      
      dogIds.forEach(dogId => {
        const threadsQuery = query(
          collection(db, 'threads'),
          where('members', 'array-contains', dogId)
        )

        const unsub = onSnapshot(threadsQuery, async (snap) => {
          let totalUnread = 0
          seenThreads.clear()

          // Collect from all dog listeners
          for (const otherDogId of dogIds) {
            const q = query(
              collection(db, 'threads'),
              where('members', 'array-contains', otherDogId)
            )
            const s = await getDocs(q)
            
            for (const threadDoc of s.docs) {
              if (seenThreads.has(threadDoc.id)) continue
              seenThreads.add(threadDoc.id)

              const thread = threadDoc.data()
              const members = thread.members || []
              const ourDogId = members.find(id => dogIds.includes(id))
              if (!ourDogId) continue

              const lastReadTs = thread.lastReadAtBy?.[ourDogId]?.toMillis?.() || 0
              const lastMessageTs = thread.lastMessageAt?.toMillis?.() || 0

              if (
                lastMessageTs > 0 &&
                lastMessageTs > lastReadTs &&
                thread.lastMessageSenderDogId !== ourDogId
              ) {
                totalUnread++
              }
            }
          }

          unreadMessages.value = totalUnread
        })

        notificationListeners.push(unsub)
      })
    }

    // Listen to likes to detect new matches
    // Check when someone likes one of our dogs
    for (const dogId of dogIds) {
      const likesQuery = query(
        collection(db, 'likes'),
        where('toDogId', '==', dogId)
      )

      const unsubLikes = onSnapshot(likesQuery, async (snap) => {
        // Check each new like to see if it creates a match
        for (const change of snap.docChanges()) {
          if (change.type === 'added') {
            const likeData = change.doc.data()
            const otherDogId = likeData.fromDogId
            const matchKey = `${dogId}_${otherDogId}`.split('_').sort().join('_')

            // Skip if we've already seen this match
            if (seenMatches.value.has(matchKey)) continue

            // Check if this creates a reciprocal match
            const isNewMatch = await checkForNewMatch(dogId, otherDogId)
            if (isNewMatch) {
              // Check if thread already exists
              const membersKey = [dogId, otherDogId].sort().join('_')
              const threadSnap = await getDocs(
                query(
                  collection(db, 'threads'),
                  where('membersKey', '==', membersKey)
                )
              )

              // If no thread exists, it's a brand new match
              if (threadSnap.empty) {
                seenMatches.value.add(matchKey)
                newMatches.value++
              }
            }
          }
        }
      })

      notificationListeners.push(unsubLikes)
    }
  })
}

/**
 * Clear new matches count (call when user views matches page)
 */
export function clearNewMatches() {
  newMatches.value = 0
  // Optionally clear seen matches to allow re-notification if needed
  // seenMatches.value.clear()
}

/**
 * Clear unread messages count (call when user views messages page)
 */
export function clearUnreadMessages() {
  // Don't clear here - let the real-time listener handle it
  // This is called when user opens messages page, but the count
  // will update automatically when they read threads
}

// Auto-initialize when auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    initNotifications(user.uid)
  } else {
    notificationListeners.forEach(unsub => unsub())
    notificationListeners.length = 0
    unreadMessages.value = 0
    newMatches.value = 0
  }
})

export { unreadMessages, newMatches, totalNotifications }

