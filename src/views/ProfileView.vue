<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-header">
      <h1>Dog Profiles</h1>
      <div class="header-actions"></div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Dog Profiles Grid -->
      <div v-if="!editingProfile" class="profiles-grid">
        <div class="profiles-header">
          <h2>Your Dog Profiles</h2>
          <p>Manage and preview your dog profiles</p>
        </div>

        <!-- Existing Dog Cards -->
        <div class="dog-cards">
          <div v-for="dog in userDogs" :key="dog.id" class="dog-card">
            <div class="card-image">
              <img
                v-if="(dog.gallery && dog.gallery.length) || (dog.photos && dog.photos.length)"
                :src="(dog.gallery?.[0] || dog.photos?.[0])"
                :alt="dog.name"
              />
              <div v-else class="no-photo">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10m0 2c-5.33 0-8 2.667-8 6v2h16v-2c0-3.333-2.67-6-8-6Z"/>
                </svg>
              </div>
            </div>

            <div class="card-content">
              <h3>{{ dog.name }}</h3>
              <p class="breed">{{ dog.breed }}</p>
              <p class="location">{{ dog.location || 'Location not set' }}</p>
            </div>

            <div class="card-actions">
              <button class="preview-btn" @click="previewDog(dog)">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                </svg>
                Preview
              </button>
              <button class="edit-btn" @click="editDog(dog)">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                </svg>
                Edit
              </button>
              <button class="delete-btn" @click="deleteDogById(dog.id)" :disabled="deletingId === dog.id">
                {{ deletingId === dog.id ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>

          <!-- Add New Dog Card -->
          <div
            class="dog-card add-card"
            role="button"
            tabindex="0"
            @click="addNewDog"
            @keydown.enter.prevent="addNewDog"
            @keydown.space.prevent="addNewDog"
          >
            <div class="add-content">
              <svg class="add-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              <h3>Add Dog Profile</h3>
              <p>Create a new profile for your dog</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile View -->
      <div v-else class="edit-profile">
        <div class="edit-header">
          <button class="back-btn" @click="editingProfile = null">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
            </svg>
            Back to Profiles
          </button>

          <h2>{{ editingProfile?.name || 'New Dog Profile' }}</h2>

          <div class="edit-actions">
            <button
              class="danger-btn"
              v-if="editingProfile?.id"
              @click="deleteCurrentDog"
              :disabled="deletingId === editingProfile?.id"
              title="Delete this profile"
            >
              {{ deletingId === editingProfile?.id ? 'Deleting…' : 'Delete Profile' }}
            </button>

            <button class="save-btn" @click="saveProfile" :disabled="saving || !currentUser">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </div>

    <!-- Tabs -->
    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="tab-content">
      <!-- Basic -->
      <div v-if="activeTab === 'basic'" class="tab-panel">
        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input v-model="dogProfile.name" id="name" type="text" placeholder="Enter dog's name" required />
          </div>

          <div class="form-group">
            <label for="breed">Breed</label>
            <input v-model="dogProfile.breed" id="breed" type="text" placeholder="Enter breed" />
          </div>

          <div class="form-group">
            <label>Sex</label>
            <div class="sex-buttons">
              <button type="button" :class="['sex-btn', { active: dogProfile.sex === 'M' }]" @click="dogProfile.sex = 'M'">Male</button>
              <button type="button" :class="['sex-btn', { active: dogProfile.sex === 'F' }]" @click="dogProfile.sex = 'F'">Female</button>
            </div>
          </div>

          <div class="form-group">
            <label>Age</label>
            <div class="age-input-group">
              <input v-model="dogProfile.age" type="text" class="age-display" placeholder="3 years" readonly />
              <div class="age-controls">
                <label class="control-label">Birthday</label>
                <input v-model="dogProfile.birthday" type="date" class="date-input" @change="calculateAge" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Weight</label>
            <div class="weight-input-group">
              <input v-model="dogProfile.weight" type="text" class="weight-display" placeholder="62 pounds" readonly />
              <div class="weight-controls">
                <label class="control-label">Weight (lbs)</label>
                <input v-model="dogProfile.weightValue" type="range" min="10" max="150" class="weight-slider" @input="updateWeight" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Temperament</label>
            <textarea v-model="dogProfile.temperament" rows="3" placeholder="Describe your dog's personality and behavior..."></textarea>
          </div>

          <div class="form-group">
            <label>Location</label>
            <input v-model="dogProfile.location" type="text" placeholder="City, State" />
          </div>
        </form>
      </div>

      <!-- Medical -->
      <div v-if="activeTab === 'medical'" class="tab-panel">
        <div class="medical-section">
          <h3>Health Certifications</h3>
          <div class="upload-area">
            <div class="upload-box">
              <svg class="upload-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <p>Upload health certificates and medical records</p>
              <button class="upload-btn" disabled>Coming soon</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Training -->
      <div v-if="activeTab === 'training'" class="tab-panel">
        <div class="training-section">
          <h3>Training & Certifications</h3>

          <div class="form-group">
            <label>Training Level</label>
            <select v-model="dogProfile.trainingLevel">
              <option value="">Select training level</option>
              <option value="basic">Basic Obedience</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div class="form-group">
            <label>Certifications</label>
            <div class="cert-checkboxes">
              <label class="checkbox-item">
                <input v-model="dogProfile.certifications" type="checkbox" value="akc" />
                <span class="checkmark"></span>
                AKC Registration
              </label>
              <label class="checkbox-item">
                <input v-model="dogProfile.certifications" type="checkbox" value="therapy" />
                <span class="checkmark"></span>
                Therapy Dog Certified
              </label>
              <label class="checkbox-item">
                <input v-model="dogProfile.certifications" type="checkbox" value="service" />
                <span class="checkmark"></span>
                Service Dog Trained
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Training Notes</label>
            <textarea v-model="dogProfile.trainingNotes" rows="4" placeholder="Describe training history and special skills..."></textarea>
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div v-if="activeTab === 'preferences'" class="tab-panel">
        <div class="preferences-section">
          <h3>Breeding Preferences</h3>
          <div class="form-group">
            <label>Looking for</label>
            <div class="preference-buttons">
              <button type="button" :class="['pref-btn', { active: dogProfile.lookingFor === 'breeding' }]" @click="dogProfile.lookingFor = 'breeding'">Breeding Partner</button>
              <button type="button" :class="['pref-btn', { active: dogProfile.lookingFor === 'companion' }]" @click="dogProfile.lookingFor = 'companion'">Companion</button>
              <button type="button" :class="['pref-btn', { active: dogProfile.lookingFor === 'both' }]" @click="dogProfile.lookingFor = 'both'">Both</button>
            </div>
          </div>

          <div class="form-group">
            <label>Preferred Breeds</label>
            <input v-model="dogProfile.preferredBreeds" type="text" placeholder="Golden Retriever, Labrador, etc." />
          </div>

          <div class="form-group">
            <label>Age Range Preference</label>
            <div class="age-range">
              <input v-model="dogProfile.minAgePref" type="number" placeholder="Min" min="0" max="20">
              <span>-</span>
              <input v-model="dogProfile.maxAgePref" type="number" placeholder="Max" min="0" max="20">
            </div>
          </div>

          <div class="form-group">
            <label>Distance Willing to Travel</label>
            <select v-model="dogProfile.travelDistance">
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
              <option value="200">200+ miles</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Gallery -->
      <div v-if="activeTab === 'gallery'" class="tab-panel">
        <div class="gallery-section">
          <h3>Photo Gallery</h3>

          <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
            <div class="upload-box">
              <svg class="upload-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
              </svg>
              <p>Upload photos of your dog</p>

              <button class="upload-btn" @click="openFilePicker" :disabled="isUploading || !currentUser">
                {{ isUploading ? 'Uploading…' : 'Choose Photos' }}
              </button>
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
              <p class="hint-line">Drag & drop images here</p>
              <p v-if="isUploading" class="progress-line">
                Uploading… {{ uploadProgress }}% ({{ activeUploads }} active)
              </p>
            </div>
          </div>

          <div class="photo-grid">
            <div v-for="photo in (dogProfile.photos || [])" :key="photo.id" class="photo-item">
              <img :src="photo.url" alt="Dog photo" />
              <button class="remove-photo" @click="removePhoto(photo)" :disabled="removingId === photo.id">
                {{ removingId === photo.id ? '…' : '×' }}
              </button>
            </div>

            <div class="photo-item add-photo" @click="openFilePicker">
              <svg class="add-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              <p>Add Photo</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-out Nav -->
    <div v-if="showMenu" class="nav-menu">
      <div class="nav-overlay" @click="toggleMenu"></div>
      <div class="nav-content">
        <div class="nav-item" @click="goToDiscover"><span>Discover Dogs</span></div>
        <div class="nav-item active" @click="toggleMenu"><span>Profile</span></div>
        <!-- /matches route will be added later; current router warning is harmless -->
        <div class="nav-item" @click="goToMatches"><span>Matches</span></div>
        <div class="nav-item" @click="goToSettings"><span>Settings</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db, storage } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where } from 'firebase/firestore'
// ✅ import BOTH uploadBytesResumable and uploadBytes
import { ref as storageRef, uploadBytesResumable, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const router = useRouter()

/* ---------- UI State ---------- */
const activeTab = ref('basic')
const showMenu = ref(false)
const saving = ref(false)
const isUploading = ref(false)
const removingId = ref(null)
const uploadProgress = ref(0)   // 0..100 across the batch
const activeUploads = ref(0)    // number of in-flight files

/* ---------- Data State ---------- */
const currentUser = ref(null)
const selectedDogId = ref('')
const userDogs = ref([])

const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'medical', label: 'Medical Papers' },
  { id: 'training', label: 'Training & Certs' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'gallery', label: 'Gallery' }
]

// REQUIRED by your Firestore rules: ownerId, name, sex ('M'|'F')
const dogProfile = reactive({
  ownerId: '',
  name: '',
  sex: 'M',
  breed: '',
  age: '',
  birthday: '',
  weight: '',
  weightValue: 50,
  temperament: '',
  location: '',
  trainingLevel: '',
  certifications: [],
  trainingNotes: '',
  lookingFor: '',
  preferredBreeds: '',
  minAgePref: '',
  maxAgePref: '',
  travelDistance: '50',
  photos: []
})

/* ---------- Helpers ---------- */
const setActiveTab = (tabId) => (activeTab.value = tabId)
const toggleMenu = () => (showMenu.value = !showMenu.value)

const calculateAge = () => {
  if (dogProfile.birthday) {
    const birthDate = new Date(dogProfile.birthday)
    const today = new Date()
    const years = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000))
    dogProfile.age = `${years} years`
  }
}
const updateWeight = () => { dogProfile.weight = `${dogProfile.weightValue} pounds` }

/* ---------- Add/Edit/Preview ---------- */
const resetDogProfile = () => {
  Object.assign(dogProfile, {
    name: '',
    breed: '',
    sex: 'male',
    age: '',
    birthday: '',
    weight: '',
    weightValue: 50,
    temperament: '',
    location: '',
    trainingLevel: '',
    certifications: [],
    trainingNotes: '',
    lookingFor: '',
    preferredBreeds: '',
    minAgePref: '',
    maxAgePref: '',
    travelDistance: '50'
  })
  photos.value = []
}

const addNewDog = () => {
  editingProfile.value = { id: null, name: 'New Dog' } // lazy ID: created on first save/upload
  resetDogProfile()
  activeTab.value = 'basic'
}

const editDog = (dog: any) => {
  editingProfile.value = { id: dog.id ?? null, name: dog.name }
  Object.assign(dogProfile, {
    ...dog,
    sex: dog.sex === 'F' ? 'female' : (dog.sex === 'M' ? 'male' : (dog.sex || 'male'))
  })
  photos.value = (dog.gallery && dog.gallery.length ? dog.gallery : dog.photos) || []
  activeTab.value = 'basic'
}

const previewDog = (dog: any) => {
  previewDogData.value = dog
  previewPhotos.value = (dog.gallery && dog.gallery.length ? dog.gallery : dog.photos) || []
  showPreview.value = true
}

/* ---------- Firestore helpers ---------- */
const dogDocRef = () => {
  if (!currentUser.value) throw new Error('Not signed in')
  if (!editingProfile.value) throw new Error('No dog selected')
  if (!editingProfile.value.id) throw new Error('No dog id yet')
  return doc(db, 'dogs', editingProfile.value.id)
}

/** Create a Firestore doc if this draft doesn't have an ID yet. */
const ensureDogDocId = async () => {
  if (!currentUser.value) throw new Error('Not signed in')
  if (editingProfile.value?.id) return editingProfile.value.id
  const basePayload: any = {
    ownerId: currentUser.value.uid,
    name: dogProfile.name || 'Untitled',
    sex: dogProfile.sex === 'female' ? 'F' : 'M',
    breed: dogProfile.breed || '',
    gallery: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  const ref = await addDoc(collection(db, 'dogs'), basePayload)
  editingProfile.value = { id: ref.id, name: basePayload.name }
  return ref.id
}

/* ---------- Save create/update ---------- */
const saveProfile = async () => {
  try {
    if (!currentUser.value) throw new Error('Sign in to save')
    saving.value = true

    // Make sure we have an ID if this is a new draft
    const id = editingProfile.value?.id ?? await ensureDogDocId()

    const payload: any = {
      ownerId: currentUser.value.uid,
      name: dogProfile.name || 'Untitled',
      sex: dogProfile.sex === 'female' ? 'F' : 'M',
      breed: dogProfile.breed || '',
      age: dogProfile.age || '',
      birthday: dogProfile.birthday || '',
      weight: dogProfile.weight || '',
      weightValue: dogProfile.weightValue || 50,
      temperament: dogProfile.temperament || '',
      location: dogProfile.location || '',
      trainingLevel: dogProfile.trainingLevel || '',
      certifications: dogProfile.certifications || [],
      trainingNotes: dogProfile.trainingNotes || '',
      lookingFor: dogProfile.lookingFor || '',
      preferredBreeds: dogProfile.preferredBreeds || '',
      minAgePref: dogProfile.minAgePref || '',
      maxAgePref: dogProfile.maxAgePref || '',
      travelDistance: dogProfile.travelDistance || '50',
      gallery: photos.value,
      updatedAt: serverTimestamp()
    }

    await setDoc(doc(db, 'dogs', id), payload, { merge: true })

    await fetchDogs()
    editingProfile.value = null
  } catch (e) {
    console.error('saveProfile error', e)
    alert('Failed to save profile. Check console for details.')
  } finally {
    saving.value = false
  }
}

/* ---------- Load dogs owned by the current user ---------- */
const fetchDogs = async () => {
  if (!currentUser.value) return
  try {
    const q = query(collection(db, 'dogs'), where('ownerId', '==', currentUser.value.uid))
    const snap = await getDocs(q)
    userDogs.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('fetchDogs error', e)
  }
}

/* ---------- Delete profile ---------- */
async function deleteDogById(id: string) {
  if (!currentUser.value) return
  const ok = confirm('Delete this dog profile? This cannot be undone.')
  if (!ok) return

  try {
    deletingId.value = id

    // 1) Read the doc to find gallery/photos to delete from Storage
    const dref = doc(db, 'dogs', id)
    const snap = await getDoc(dref)
    if (snap.exists()) {
      const data: any = snap.data()
      const urls: string[] = [...(data.gallery || []), ...(data.photos || [])]
      // Best-effort delete storage files; ignore failures (could be external URLs)
      for (const url of urls) {
        try {
          const objRef = sRef(storage, url) // ref can take a full https URL
          await deleteObject(objRef)
        } catch (_) { /* ignore */ }
      }
    }

    // 2) Delete the Firestore doc
    await deleteDoc(dref)

    // 3) Update local state
    userDogs.value = userDogs.value.filter(d => d.id !== id)
    if (editingProfile.value?.id === id) {
      editingProfile.value = null
      resetDogProfile()
    }

  } catch (e) {
    console.error('deleteDogById error', e)
    alert('Failed to delete profile. Check console for details.')
  } finally {
    deletingId.value = null
  }
}

const deleteCurrentDog = async () => {
  if (!editingProfile.value?.id) return
  await deleteDogById(editingProfile.value.id)
}

/* ---------- Uploads ---------- */
const choosePhotos = () => fileInput.value?.click()

const onFilesSelected = async (e: any) => {
  const input = e.target
  if (!input.files || input.files.length === 0) return
  if (!currentUser.value) { alert('Please sign in to upload photos'); return }

  uploading.value = true
  uploadProgress.value = 0

  try {
    // Ensure we have a Firestore doc for this draft (lazy create)
    const id = await ensureDogDocId()

    for (const file of Array.from(input.files as FileList)) {
      const path = `dogs/${currentUser.value.uid}/${id}/gallery/${Date.now()}_${file.name}`
      const storageRef = sRef(storage, path)
      const task = uploadBytesResumable(storageRef, file, { contentType: file.type })

      await new Promise<string>((resolve, reject) => {
        task.on(
          'state_changed',
          (snap) => { uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100) },
          (err) => reject(err),
          async () => {
            try {
              const url = await getDownloadURL(task.snapshot.ref)
              await updateDoc(doc(db, 'dogs', id), { gallery: arrayUnion(url), updatedAt: serverTimestamp() })
              photos.value.push(url)
              resolve(url)
            } catch (err) { reject(err as any) }
          }
        )
      })
    }
  } catch (err) {
    console.error('Upload failed', err)
    alert('Upload failed. Check console for details.')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    if (fileInput.value) fileInput.value.value = ''
  }
}

const removePhoto = async (url: string) => {
  if (!currentUser.value || !editingProfile.value?.id) return
  try {
    const objectRef = sRef(storage, url)
    await deleteObject(objectRef).catch(() => {})
  } catch (_) { /* ignore */ }

  try {
    const id = editingProfile.value.id
    const snap = await getDoc(doc(db, 'dogs', id))
    if (snap.exists()) {
      const data = snap.data() as any
      const next = (data.gallery || []).filter((u: string) => u !== url)
      await updateDoc(doc(db, 'dogs', id), { gallery: next, updatedAt: serverTimestamp() })
    }
  } catch (e) {
    console.error('removePhoto error', e)
  } finally {
    photos.value = photos.value.filter(u => u !== url)
  }
}

const handleDrop = (e: DragEvent) => {
  const files = Array.from(e.dataTransfer?.files || [])
  if (!files.length) return
  onFilesSelected({ target: { files } })
}

/* ---------- Preview handlers ---------- */
const handleLike = () => { showPreview.value = false }
const handlePass = () => { showPreview.value = false }

/* ---------- Navigation ---------- */
const goToDiscover = () => { router.push('/discover'); showMenu.value = false }
const goToMatches  = () => { router.push('/matches');  showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }

/* ---------- Init + Auth Redirect ---------- */
let unsubscribeAuth: (() => void) | null = null

onMounted(async () => {
  unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
    if (!u) {
      currentUser.value = null
      userDogs.value = []
      router.replace('/')   // bounce home if signed out
    } else {
      selectedDogId.value = 'new'
      resetDogProfile()
    }
  }
}

/* ---------- Load a dog ---------- */
const loadDogProfile = async () => {
  if (selectedDogId.value === 'new') { resetDogProfile(); return }
  try {
    const ref = dogDocRef()
    const snap = await getDoc(ref)
    if (snap.exists()) {
      resetDogProfile()
      const data = snap.data()
      Object.assign(dogProfile, data)
      if (!dogProfile.photos) dogProfile.photos = []
    }
  } catch (e) {
    console.error('loadDogProfile error', e)
  }
}

/* ---------- Save everything (ONE header button) ---------- */
const saveProfile = async () => {
  try {
    uidGuard()
    saving.value = true

    let dogId = selectedDogId.value
    if (!dogId || dogId === 'new') {
      dogId = `${Date.now()}`
      selectedDogId.value = dogId
    }
    const ref = doc(db, 'dogs', dogId)

    const payload = {
      ownerId: currentUser.value.uid,
      name: dogProfile.name || '',
      sex: dogProfile.sex === 'F' ? 'F' : 'M',
      breed: dogProfile.breed || '',
      age: dogProfile.age || '',
      birthday: dogProfile.birthday || '',
      weight: dogProfile.weight || '',
      weightValue: dogProfile.weightValue ?? 50,
      temperament: dogProfile.temperament || '',
      location: dogProfile.location || '',
      trainingLevel: dogProfile.trainingLevel || '',
      certifications: Array.isArray(dogProfile.certifications) ? dogProfile.certifications : [],
      trainingNotes: dogProfile.trainingNotes || '',
      lookingFor: dogProfile.lookingFor || '',
      preferredBreeds: dogProfile.preferredBreeds || '',
      minAgePref: dogProfile.minAgePref || '',
      maxAgePref: dogProfile.maxAgePref || '',
      travelDistance: dogProfile.travelDistance || '50',
      photos: Array.isArray(dogProfile.photos) ? dogProfile.photos : []
    }

    await setDoc(ref, payload)
    await fetchDogs()
  } catch (e) {
    console.error('saveProfile error', e)
    alert('Failed to save. Check console.')
  } finally {
    saving.value = false
  }
}

/* ---------- Upload helper: resumable with fallback ---------- */
async function uploadWithResumableThenFallback(sref, file, onProgress) {
  const TIMEOUT_MS = 300_000 // 5 min per file
  const STALL_MS = 45_000
  let timeoutId, stallId
  let lastBytes = 0

  // Prefer resumable (good for big files). If it stalls or times out, cancel and fallback.
  const task = uploadBytesResumable(sref, file, {
    cacheControl: 'public,max-age=31536000',
    contentType: file.type || 'application/octet-stream',
  })

  try {
    await new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => { try { task.cancel() } catch {} ; reject(new Error('resumable-timeout')) }, TIMEOUT_MS)

      const resetStallTimer = () => {
        clearTimeout(stallId)
        stallId = setTimeout(() => {
          console.warn('[upload] Stalled for 45s:', file.name, '— bytesTransferred=' + lastBytes)
          // Let it continue; final TIMEOUT_MS will cancel if needed
        }, STALL_MS)
      }
      resetStallTimer()

      task.on('state_changed',
        (snap) => {
          lastBytes = snap.bytesTransferred
          if (onProgress) onProgress(snap.bytesTransferred, snap.totalBytes)
          resetStallTimer()
        },
        (err) => reject(err),
        () => resolve()
      )
    })
    clearTimeout(timeoutId); clearTimeout(stallId)
    const url = await getDownloadURL(task.snapshot.ref)
    return { url }
  } catch (err) {
    clearTimeout(timeoutId); clearTimeout(stallId)
    console.warn('[upload] resumable failed, falling back to uploadBytes:', err?.code || err?.message || err)
    // Fallback: single request
    const snap = await uploadBytes(sref, file, {
      cacheControl: 'public,max-age=31536000',
      contentType: file.type || 'application/octet-stream',
    })
    const url = await getDownloadURL(snap.ref)
    return { url }
  }
}

/* ---------- Gallery: Upload & Remove ---------- */
const fileInput = ref(null)
const openFilePicker = () => fileInput.value?.click()

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  addFilesFirebase(files)
  e.target.value = ''
}
const handleDrop = (e) => {
  const files = Array.from(e.dataTransfer?.files || [])
  if (!files.length) return
  addFilesFirebase(files)
}

const addFilesFirebase = async (files) => {
  try {
    uidGuard()
    isUploading.value = true
    uploadProgress.value = 0
    activeUploads.value = 0

    // Ensure doc exists & passes rules
    const ref = await ensureDogDocExists()

    const MAX_MB = 10
    const accepted = files.filter(f => f.type.startsWith('image/') && f.size <= MAX_MB * 1024 * 1024)
    const rejected = files.filter(f => !accepted.includes(f))
    if (rejected.length) alert(`Some files were skipped (not images or > ${MAX_MB}MB).`)
    if (!accepted.length) return

    const totalBytes = accepted.reduce((s, f) => s + f.size, 0)
    let completedBytes = 0
    const uploaded = []

    for (const file of accepted) {
      activeUploads.value++
      const path = `dogs/${currentUser.value.uid}/${selectedDogId.value}/${Date.now()}_${file.name}`
      const sref = storageRef(storage, path)
      console.log('[upload] Starting', file.name, '→', path)

      try {
        const { url } = await uploadWithResumableThenFallback(
          sref,
          file,
          (bytesTransferred, fileTotal) => {
            const aggregate = Math.round(((completedBytes + bytesTransferred) / totalBytes) * 100)
            uploadProgress.value = Math.min(100, Math.max(0, aggregate))
          }
        )
        uploaded.push({ id: (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)), url, storagePath: path })
        completedBytes += file.size
        uploadProgress.value = Math.round((completedBytes / totalBytes) * 100)
      } catch (e) {
        console.error('[upload] Error for', file.name, e)
        alert(`Upload failed for ${file.name}: ${e?.code || e?.message || e}`)
      } finally {
        activeUploads.value = Math.max(0, activeUploads.value - 1)
      }
    }

    // Persist merged photos
    if (uploaded.length) {
      const newPhotos = [...(dogProfile.photos || []), ...uploaded]
      dogProfile.photos = newPhotos
      await updateDoc(ref, { photos: newPhotos })
      const idx = userDogs.value.findIndex(d => d.id === selectedDogId.value)
      if (idx !== -1) userDogs.value[idx].photos = newPhotos
      console.log('[upload] Complete:', uploaded.length, 'file(s)')
    }
  } catch (e) {
    console.error('upload error', e)
    alert(e?.message || 'Upload failed. Check console.')
  } finally {
    isUploading.value = false
    activeUploads.value = 0
    uploadProgress.value = 0
  }
}

const removePhoto = async (photo) => {
  try {
    uidGuard()
    removingId.value = photo.id
    if (photo.storagePath) {
      try { await deleteObject(storageRef(storage, photo.storagePath)) }
      catch (e) { console.warn('Storage delete failed, continuing:', e) }
    }
    const newPhotos = (dogProfile.photos || []).filter(p => p.id !== photo.id)
    dogProfile.photos = newPhotos
    const ref = dogDocRef()
    await updateDoc(ref, { photos: newPhotos })

    const idx = userDogs.value.findIndex(d => d.id === selectedDogId.value)
    if (idx !== -1) userDogs.value[idx].photos = newPhotos
  } catch (e) {
    console.error('removePhoto error', e)
    alert('Failed to remove photo.')
  } finally {
    removingId.value = null
  }
}

/* ---------- Auth bootstrap ---------- */
onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    currentUser.value = u || null
    if (currentUser.value) {
      dogProfile.ownerId = currentUser.value.uid
      await fetchDogs()
      if (selectedDogId.value && selectedDogId.value !== 'new') {
        await loadDogProfile()
      }
    } else {
      selectedDogId.value = 'new'
      resetDogProfile()
    }
  })
})
</script>

<style scoped>
/* (styles unchanged) */
.profile-page { min-height: 100vh; background: #f8f9fa; }
.profile-header { background: #6A2C4A; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
.profile-header h1 { font-size: 1.5rem; margin: 0; }
.header-actions { display: flex; gap: 0.5rem; align-items: center; }
.menu-btn { background: none; border: none; color: white; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background-color 0.3s; }
.menu-btn:hover { background: rgba(255,255,255,0.1); }
.menu-icon { width: 24px; height: 24px; }

.preview-btn { background: #6A2C4A; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-right: 0.5rem; }
.preview-btn:hover:enabled { background: #5a2438; transform: translateY(-1px); box-shadow: 0 2px 10px rgba(106, 44, 74, 0.3); }
.preview-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

.main-content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.profiles-grid { display: flex; flex-direction: column; gap: 2rem; }
.profiles-header h2 { margin: 0 0 0.5rem 0; color: #333; font-size: 2rem; }
.profiles-header p { margin: 0; color: #666; font-size: 1.1rem; }

.dog-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.dog-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer; }
.dog-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.card-image { height: 200px; overflow: hidden; position: relative; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.no-photo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #e9ecef; color: #6c757d; }
.no-photo svg { width: 48px; height: 48px; }
.card-content { padding: 1.5rem; }
.card-content h3 { margin: 0 0 0.5rem 0; color: #333; font-size: 1.25rem; font-weight: 600; }
.card-content .breed { margin: 0 0 0.25rem 0; color: #6A2C4A; font-weight: 500; }
.card-content .location { margin: 0; color: #666; font-size: 0.9rem; }
.card-actions { padding: 0 1.5rem 1.5rem 1.5rem; display: flex; gap: 0.75rem; }
.edit-btn { background: #e9ecef; color: #333; border: none; border-radius: 8px; padding: 0.75rem; font-weight: 500; cursor: pointer; }
.edit-btn:hover { background: #dee2e6; }
.delete-btn { background: #fff0f0; color: #c0392b; border: 1px solid #f5c6cb; border-radius: 8px; padding: 0.75rem; font-weight: 600; cursor: pointer; }
.delete-btn:hover { background: #ffe3e3; }

.edit-profile { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.edit-header { background: #6A2C4A; color: white; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.back-btn { background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; transition: opacity 0.2s; }
.back-btn:hover { opacity: 0.8; }
.back-btn svg { width: 20px; height: 20px; }
.edit-header h2 { margin: 0; font-size: 1.5rem; }
.edit-actions { display: flex; gap: .5rem; align-items: center; }
.save-btn { background: white; color: #6A2C4A; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.save-btn:hover:enabled { background: #f8f9fa; transform: translateY(-1px); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.danger-btn { background: #fff0f0; color: #c0392b; border: 1px solid #f5c6cb; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 700; }

.tab-navigation { background:#e9ecef; display:flex; padding:0 2rem; border-bottom:1px solid #dee2e6; }
.tab-btn { background:none; border:none; padding:1rem 1.5rem; cursor:pointer; color:#6c757d; font-weight:500; border-bottom:3px solid transparent; transition:all .3s; }
.tab-btn.active { background:white; color:#333; border-bottom-color:#6A2C4A; border-radius:8px 8px 0 0; }
.tab-btn:hover:not(.active) { color:#6A2C4A; }

.tab-content { background:white; min-height:calc(100vh - 140px); padding:2rem; }
.tab-panel { max-width:600px; margin:0 auto; }
.profile-form { display:flex; flex-direction:column; gap:1.5rem; }

.form-group { display:flex; flex-direction:column; }
.form-group label { font-weight:600; color:#333; margin-bottom:.5rem; }
.form-group input, .form-group select, .form-group textarea { padding:.75rem; border:2px solid #e9ecef; border-radius:8px; font-size:1rem; transition:border-color .3s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline:none; border-color:#6A2C4A; }

.sex-buttons { display:flex; gap:.5rem; }
.sex-btn { flex:1; padding:.75rem; border:2px solid #e9ecef; background:white; border-radius:25px; cursor:pointer; transition:all .3s; font-weight:500; }
.sex-btn.active { background:#6A2C4A; color:white; border-color:#6A2C4A; }

.age-input-group, .weight-input-group { display:flex; flex-direction:column; gap:1rem; }
.age-display, .weight-display { background:#f8f9fa; color:#666; }
.control-label { font-size:.9rem; color:#666; margin-bottom:.25rem; }
.date-input { width:100%; }
.weight-slider { width:100%; height:6px; border-radius:3px; background:#e9ecef; outline:none; -webkit-appearance:none; }
.weight-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%; background:#6A2C4A; cursor:pointer; }
.weight-slider::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#6A2C4A; cursor:pointer; border:none; }

.medical-section, .training-section, .preferences-section, .gallery-section { display:flex; flex-direction:column; gap:2rem; }
.medical-section h3, .training-section h3, .preferences-section h3, .gallery-section h3 { color:#333; margin:0; font-size:1.5rem; }

.upload-area { border:2px dashed #e9ecef; border-radius:12px; padding:2rem; text-align:center; background:#f8f9fa; }
.upload-box { display:flex; flex-direction:column; align-items:center; gap:1rem; }
.upload-icon { width:48px; height:48px; color:#6c757d; }
.upload-btn { background:#6A2C4A; color:white; border:none; padding:.75rem 1.5rem; border-radius:8px; cursor:pointer; font-weight:500; }
.hint-line { margin:.5rem 0 0; color:#666; font-size:.9rem; }
.progress-line { margin:.25rem 0 0; color:#444; font-size:.9rem; }

.certifications-list { display:flex; flex-direction:column; gap:1rem; }
.cert-item { display:flex; justify-content:space-between; align-items:center; padding:1rem; border:1px solid #e9ecef; border-radius:8px; background:white; }
.cert-info h4 { margin:0 0 .25rem 0; color:#333; }
.cert-info p { margin:0; color:#666; font-size:.9rem; }
.cert-status { padding:.25rem .75rem; border-radius:20px; font-size:.8rem; font-weight:600; }
.cert-status.verified { background:#d4edda; color:#155724; }
.cert-status.pending { background:#fff3cd; color:#856404; }

.cert-checkboxes { display:flex; flex-direction:column; gap:.75rem; }
.checkbox-item { display:flex; align-items:center; gap:.75rem; cursor:pointer; }
.checkbox-item input[type="checkbox"] { width:auto; margin:0; transform:scale(1.2); }

.preference-buttons { display:flex; gap:.5rem; flex-wrap:wrap; }
.pref-btn { padding:.75rem 1rem; border:2px solid #e9ecef; background:white; border-radius:25px; cursor:pointer; transition:all .3s; font-weight:500; }
.pref-btn.active { background:#6A2C4A; color:white; border-color:#6A2C4A; }

.age-range { display:flex; align-items:center; gap:.5rem; }
.age-range input { flex:1; }

.photo-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:1rem; }
.photo-item { position:relative; aspect-ratio:1; border-radius:12px; overflow:hidden; background:#f8f9fa; border:2px solid #e9ecef; }
.photo-item img { width:100%; height:100%; object-fit:cover; }
.remove-photo { position:absolute; top:.5rem; right:.5rem; background:rgba(0,0,0,.7); color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.add-photo { display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:all .3s; }
.add-photo:hover { border-color:#6A2C4A; background:#f8f9fa; }
.add-icon { width:32px; height:32px; color:#6c757d; margin-bottom:.5rem; }

.preference-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.pref-btn { padding: 0.75rem 1rem; border: 2px solid #e9ecef; background: white; border-radius: 25px; cursor: pointer; transition: all 0.3s; font-weight: 500; }
.pref-btn.active { background: #6A2C4A; color: white; border-color: #6A2C4A; }

.nav-menu { position: fixed; top: 0; right: 0; width: 100%; height: 100%; z-index: 200; }
.nav-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.nav-content { position: absolute; top: 0; right: 0; width: 250px; height: 100%; background: #6A2C4A; padding: 2rem 0; }
.nav-item { padding: 1rem 2rem; color: white; cursor: pointer; transition: background-color 0.3s; }
.nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); }
.nav-item span { font-size: 1.1rem; font-weight: 500; }

.dog-card.add-card { cursor: pointer; outline: none; }
.dog-card.add-card:focus { box-shadow: 0 0 0 3px rgba(106,44,74,.25); }

@media (max-width: 768px) {
  .profile-header { padding:1rem; }
  .tab-navigation { padding:0 1rem; overflow-x:auto; }
  .tab-btn { padding:.75rem 1rem; white-space:nowrap; }
  .tab-content { padding:1rem; }
  .sex-buttons, .preference-buttons { flex-direction:column; }
  .nav-content { width:200px; }
}
</style>
