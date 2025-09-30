<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-header">
      <h1>Dog Profiles</h1>
      <div class="header-actions">
        <button @click="toggleMenu" class="menu-btn" aria-label="Open menu">
          <svg class="menu-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
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
              <img v-if="dog.photos && dog.photos.length > 0" :src="dog.photos[0]" :alt="dog.name" />
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
            </div>
          </div>

          <!-- Add New Dog Card -->
          <div class="dog-card add-card" @click="addNewDog">
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
          <button class="save-btn" @click="saveProfile" :disabled="saving || !currentUser">
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
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

        <!-- Tab Content (your existing content) -->
        <div class="tab-content">
          <!-- Basic Info Tab -->
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
                  <button type="button" :class="['sex-btn', { active: dogProfile.sex === 'male' }]" @click="dogProfile.sex = 'male'">Male</button>
                  <button type="button" :class="['sex-btn', { active: dogProfile.sex === 'female' }]" @click="dogProfile.sex = 'female'">Female</button>
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

          <!-- Gallery Tab -->
          <div v-if="activeTab === 'gallery'" class="tab-panel">
            <div class="gallery-section">
              <h3>Photo Gallery</h3>

              <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
                <div class="upload-box">
                  <svg class="upload-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
                  </svg>
                  <p>Upload photos of your dog</p>
                  <button class="upload-btn" @click="choosePhotos" :disabled="uploading">
                    {{ uploading ? `Uploading… ${uploadProgress}%` : 'Choose Photos' }}
                  </button>
                  <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFilesSelected" />
                </div>
              </div>

              <div class="photo-grid">
                <div v-for="url in photos" :key="url" class="photo-item">
                  <img :src="url" alt="Dog photo" />
                  <button class="remove-photo" @click="removePhoto(url)">×</button>
                </div>

                <div class="photo-item add-photo" @click="choosePhotos">
                  <svg class="add-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  </svg>
                  <p>Add Photo</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Other tabs (Medical, Training, Preferences) would go here -->
        </div>
      </div>
    </div>

    <!-- Profile Preview Modal -->
    <ProfilePreview
      v-if="showPreview"
      :profile="previewDogData"
      :photos="previewPhotos"
      @close="showPreview = false"
      @edit="showPreview = false; editDog(previewDogData)"
      @like="handleLike"
      @pass="handlePass"
    />

    <!-- Slide-out Nav -->
    <div v-if="showMenu" class="nav-menu">
      <div class="nav-overlay" @click="toggleMenu"></div>
      <div class="nav-content">
        <div class="nav-item" @click="goToDiscover"><span>Discover Dogs</span></div>
        <div class="nav-item active" @click="toggleMenu"><span>Profile</span></div>
        <div class="nav-item" @click="goToMatches"><span>Matches</span></div>
        <div class="nav-item" @click="goToSettings"><span>Settings</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db, storage } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import ProfilePreview from '../components/ProfilePreview.vue'

const router = useRouter()

// State
const showMenu = ref(false)
const editingProfile = ref(null)
const showPreview = ref(false)
const previewDogData = ref(null)
const previewPhotos = ref([])
const activeTab = ref('basic')
const saving = ref(false)
const currentUser = ref(null)
const userDogs = ref([])

// Upload state
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const photos = ref([])

// Dog profile data
const dogProfile = reactive({
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

const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'medical', label: 'Medical Papers' },
  { id: 'training', label: 'Training & Certs' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'gallery', label: 'Gallery' }
]

// Functions
const toggleMenu = () => { showMenu.value = !showMenu.value }
const setActiveTab = (tabId) => { activeTab.value = tabId }

const calculateAge = () => {
  if (dogProfile.birthday) {
    const birthDate = new Date(dogProfile.birthday)
    const today = new Date()
    const ageInYears = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    dogProfile.age = `${ageInYears} years`
  }
}

const updateWeight = () => { dogProfile.weight = `${dogProfile.weightValue} pounds` }

const addNewDog = () => {
  editingProfile.value = { id: 'new', name: 'New Dog' }
  resetDogProfile()
  activeTab.value = 'basic'
}

const editDog = (dog) => {
  editingProfile.value = dog
  Object.assign(dogProfile, dog)
  photos.value = dog.photos || []
  activeTab.value = 'basic'
}

const previewDog = (dog) => {
  previewDogData.value = dog
  previewPhotos.value = dog.photos || []
  showPreview.value = true
}

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

// Firebase functions (your existing upload/save logic)
const dogDocRef = () => {
  if (!currentUser.value) throw new Error('Not signed in')
  if (!editingProfile.value?.id) throw new Error('No dog selected')
  return doc(db, 'dogs', editingProfile.value.id)
}

const saveProfile = async () => {
  try {
    if (!currentUser.value) throw new Error('Sign in to save')
    saving.value = true
    
    const payload = {
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
      gallery: photos.value
    }
    
    await setDoc(dogDocRef(), payload, { merge: true })
    await fetchDogs()
    editingProfile.value = null
  } catch (e) {
    console.error('saveProfile error', e)
    alert('Failed to save profile. Check console for details.')
  } finally {
    saving.value = false
  }
}

const fetchDogs = async () => {
  if (!currentUser.value) return
  try {
    // Your existing fetchDogs logic
    userDogs.value = [
      { id: '1', name: 'Tango', breed: 'Golden Retriever', sex: 'male', age: '3 years', birthday: '2021-01-14',
        weight: '62 pounds', weightValue: 62, temperament: 'Friendly, energetic, and great with kids',
        location: 'San Francisco, CA', trainingLevel: 'intermediate', certifications: ['akc'],
        trainingNotes: 'Completed basic obedience training at 6 months. Excellent recall and house trained.',
        lookingFor: 'breeding', preferredBreeds: 'Golden Retriever, Labrador', minAgePref: 2, maxAgePref: 5, travelDistance: '50',
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=500&fit=crop'] },
      { id: '2', name: 'Luna', breed: 'German Shepherd', sex: 'female', age: '2 years', birthday: '2022-03-15',
        weight: '55 pounds', weightValue: 55, temperament: 'Intelligent, protective, and loyal',
        location: 'San Francisco, CA', trainingLevel: 'advanced', certifications: ['akc', 'therapy'],
        trainingNotes: 'Advanced obedience training completed. Therapy dog certified.',
        lookingFor: 'companion', preferredBreeds: 'German Shepherd, Belgian Malinois', minAgePref: 1, maxAgePref: 4, travelDistance: '25',
        photos: ['https://images.unsplash.com/photo-1547407139-3c921a71905c?w=400&h=500&fit=crop'] }
    ]
  } catch (e) {
    console.error('fetchDogs error', e)
  }
}

// Upload functions (your existing upload logic)
const choosePhotos = () => fileInput.value?.click()

const onFilesSelected = async (e) => {
  const input = e.target
  if (!input.files || input.files.length === 0) return
  if (!currentUser.value) { 
    console.warn('No auth user - please sign in first')
    alert('Please sign in to upload photos')
    return 
  }

  console.log('Starting upload for user:', currentUser.value.uid)
  uploading.value = true
  uploadProgress.value = 0

  try {
    for (const file of Array.from(input.files)) {
      const path = `dogs/${currentUser.value.uid}/${editingProfile.value.id}/gallery/${Date.now()}_${file.name}`
      console.log('Uploading to path:', path)
      const storageRef = sRef(storage, path)
      const task = uploadBytesResumable(storageRef, file, { contentType: file.type })
      console.log('Upload task created, starting upload...')

      await new Promise((resolve, reject) => {
        task.on('state_changed',
          (snap) => {
            uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          },
          (err) => reject(err),
          async () => {
            try {
              const url = await getDownloadURL(task.snapshot.ref)
              await updateDoc(dogDocRef(), { gallery: arrayUnion(url) })
              photos.value.push(url)
              resolve(url)
            } catch (err) {
              reject(err)
            }
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

const removePhoto = async (url) => {
  if (!currentUser.value) return
  try {
    const objectRef = sRef(storage, url)
    await deleteObject(objectRef).catch(() => {})
  } catch (e) {
    console.warn('deleteObject warning:', e)
  }
  try {
    const snap = await getDoc(dogDocRef())
    if (snap.exists()) {
      const data = snap.data()
      const next = (data.gallery || []).filter((u) => u !== url)
      await updateDoc(dogDocRef(), { gallery: next })
    }
  } catch (e) {
    console.error('removePhoto error', e)
  } finally {
    photos.value = photos.value.filter(u => u !== url)
  }
}

const handleDrop = (e) => {
  const files = Array.from(e.dataTransfer?.files || [])
  if (!files.length) return
  onFilesSelected({ target: { files } })
}

// Preview handlers
const handleLike = () => {
  console.log('Profile liked!')
  showPreview.value = false
}

const handlePass = () => {
  console.log('Profile passed!')
  showPreview.value = false
}

// Navigation
const goToDiscover = () => { router.push('/discover'); showMenu.value = false }
const goToMatches = () => { router.push('/matches'); showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }

onMounted(async () => {
  onAuthStateChanged(auth, async (u) => {
    currentUser.value = u ? { uid: u.uid } : null
    if (currentUser.value) {
      await fetchDogs()
    }
  })
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.profile-header {
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

.profile-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.menu-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.menu-btn:hover {
  background: rgba(255,255,255,0.1);
}

.menu-icon {
  width: 24px;
  height: 24px;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profiles-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profiles-header h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2rem;
}

.profiles-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.dog-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dog-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.dog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.card-image {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #6c757d;
}

.no-photo svg {
  width: 48px;
  height: 48px;
}

.card-content {
  padding: 1.5rem;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-content .breed {
  margin: 0 0 0.25rem 0;
  color: #6A2C4A;
  font-weight: 500;
}

.card-content .location {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.card-actions {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
}

.preview-btn, .edit-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.preview-btn {
  background: #6A2C4A;
  color: white;
}

.preview-btn:hover {
  background: #5a2438;
}

.edit-btn {
  background: #e9ecef;
  color: #333;
}

.edit-btn:hover {
  background: #dee2e6;
}

.preview-btn svg, .edit-btn svg {
  width: 16px;
  height: 16px;
}

.add-card {
  border: 2px dashed #6A2C4A;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.add-content {
  text-align: center;
  color: #6A2C4A;
}

.add-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.add-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.add-content p {
  margin: 0;
  color: #666;
}

/* Edit Profile Styles */
.edit-profile {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.edit-header {
  background: #6A2C4A;
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.8;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.edit-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.save-btn {
  background: white;
  color: #6A2C4A;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:enabled {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tab-navigation {
  background: #e9ecef;
  display: flex;
  padding: 0 2rem;
  border-bottom: 1px solid #dee2e6;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  color: #6c757d;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn.active {
  background: white;
  color: #333;
  border-bottom-color: #6A2C4A;
  border-radius: 8px 8px 0 0;
}

.tab-btn:hover:not(.active) {
  color: #6A2C4A;
}

.tab-content {
  background: white;
  min-height: 500px;
  padding: 2rem;
}

.tab-panel {
  max-width: 600px;
  margin: 0 auto;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #6A2C4A;
}

.sex-buttons {
  display: flex;
  gap: 0.5rem;
}

.sex-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.sex-btn.active {
  background: #6A2C4A;
  color: white;
  border-color: #6A2C4A;
}

.age-input-group, .weight-input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.age-display, .weight-display {
  background: #f8f9fa;
  color: #666;
}

.control-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.date-input {
  width: 100%;
}

.weight-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
}

.weight-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6A2C4A;
  cursor: pointer;
}

.weight-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6A2C4A;
  cursor: pointer;
  border: none;
}

.gallery-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.gallery-section h3 {
  color: #333;
  margin: 0;
  font-size: 1.5rem;
}

.upload-area {
  border: 2px dashed #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: #f8f9fa;
}

.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #6c757d;
}

.upload-btn {
  background: #6A2C4A;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.add-photo:hover {
  border-color: #6A2C4A;
  background: #f8f9fa;
}

.add-photo .add-icon {
  width: 32px;
  height: 32px;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.nav-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 200;
}

.nav-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
}

.nav-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 250px;
  height: 100%;
  background: #6A2C4A;
  padding: 2rem 0;
}

.nav-item {
  padding: 1rem 2rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-item:hover, .nav-item.active {
  background: rgba(255,255,255,0.1);
}

.nav-item span {
  font-size: 1.1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .dog-cards {
    grid-template-columns: 1fr;
  }
  
  .edit-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .tab-navigation {
    padding: 0 1rem;
    overflow-x: auto;
  }
  
  .tab-btn {
    padding: 0.75rem 1rem;
    white-space: nowrap;
  }
  
  .tab-content {
    padding: 1rem;
  }
  
  .sex-buttons {
    flex-direction: column;
  }
  
  .nav-content {
    width: 200px;
  }
}
</style>
