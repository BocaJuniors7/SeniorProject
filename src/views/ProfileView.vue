<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-header">
      <h1>Profile</h1>
      <div class="header-actions">
        <button class="save-all-btn" @click="saveProfile" :disabled="saving || !currentUser">
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
        <button @click="toggleMenu" class="menu-btn" aria-label="Open menu">
          <svg class="menu-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Dog Selector -->
    <div class="dog-selector">
      <label for="dog-select">Select Dog:</label>
      <select v-model="selectedDogId" @change="loadDogProfile" id="dog-select">
        <option v-for="dog in userDogs" :key="dog.id" :value="dog.id">
          {{ dog.name }} ({{ dog.breed }})
        </option>
        <option value="new">+ Add New Dog</option>
      </select>
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
            <input 
              v-model="dogProfile.breed" 
              type="text" 
              id="breed" 
              placeholder="Enter breed"
              required
            />
          </div>

          <div class="form-group">
            <label>Sex</label>
            <div class="sex-buttons">
              <button 
                type="button"
                :class="['sex-btn', { active: dogProfile.sex === 'male' }]"
                @click="dogProfile.sex = 'male'"
              >
                Male
              </button>
              <button 
                type="button"
                :class="['sex-btn', { active: dogProfile.sex === 'female' }]"
                @click="dogProfile.sex = 'female'"
              >
                Female
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="age">Age</label>
            <div class="age-input-group">
              <input 
                v-model="dogProfile.age" 
                type="text" 
                id="age" 
                placeholder="3 years"
                class="age-display"
                readonly
              />
              <div class="age-controls">
                <label class="control-label">Birthday</label>
                <input 
                  v-model="dogProfile.birthday" 
                  type="date" 
                  class="date-input"
                  @change="calculateAge"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="weight">Weight</label>
            <div class="weight-input-group">
              <input 
                v-model="dogProfile.weight" 
                type="text" 
                id="weight" 
                placeholder="62 pounds"
                class="weight-display"
                readonly
              />
              <div class="weight-controls">
                <label class="control-label">Weight (lbs)</label>
                <input 
                  v-model="dogProfile.weightValue" 
                  type="range" 
                  min="10" 
                  max="150" 
                  class="weight-slider"
                  @input="updateWeight"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="temperament">Temperament</label>
            <textarea 
              v-model="dogProfile.temperament" 
              id="temperament" 
              placeholder="Describe your dog's personality and behavior..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input 
              v-model="dogProfile.location" 
              type="text" 
              id="location" 
              placeholder="City, State"
            />
          </div>

          <button type="submit" class="save-btn">Save Changes</button>
        </form>
      </div>

      <!-- Medical Papers Tab -->
      <div v-if="activeTab === 'medical'" class="tab-panel">
        <div class="medical-section">
          <h3>Health Certifications</h3>
          <div class="upload-area">
            <div class="upload-box">
              <svg class="upload-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <p>Upload health certificates and medical records</p>
              <button class="upload-btn" @click="choosePhotos" :disabled="uploading">
                {{ uploading ? `Uploading… ${uploadProgress}%` : 'Choose Files' }}
              </button>
              <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFilesSelected" />
              <p v-if="uploading">Uploading… {{ uploadProgress }}%</p>
            </div>
          </div>

          <div class="certifications-list">
            <div class="cert-item">
              <div class="cert-info">
                <h4>Vaccination Records</h4>
                <p>Updated: March 15, 2024</p>
              </div>
              <div class="cert-status verified">✓ Verified</div>
            </div>
            <div class="cert-item">
              <div class="cert-info">
                <h4>Health Certificate</h4>
                <p>Updated: February 28, 2024</p>
              </div>
              <div class="cert-status pending">⏳ Pending Review</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Training & Certs Tab -->
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
            <label for="training-notes">Training Notes</label>
            <textarea 
              v-model="dogProfile.trainingNotes" 
              id="training-notes" 
              placeholder="Describe training history and special skills..."
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Preferences Tab -->
      <div v-if="activeTab === 'preferences'" class="tab-panel">
        <div class="preferences-section">
          <h3>Breeding Preferences</h3>
          
          <div class="form-group">
            <label>Looking for</label>
            <div class="preference-buttons">
              <button 
                type="button"
                :class="['pref-btn', { active: dogProfile.lookingFor === 'breeding' }]"
                @click="dogProfile.lookingFor = 'breeding'"
              >
                Breeding Partner
              </button>
              <button 
                type="button"
                :class="['pref-btn', { active: dogProfile.lookingFor === 'companion' }]"
                @click="dogProfile.lookingFor = 'companion'"
              >
                Companion
              </button>
              <button 
                type="button"
                :class="['pref-btn', { active: dogProfile.lookingFor === 'both' }]"
                @click="dogProfile.lookingFor = 'both'"
              >
                Both
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Preferred Breeds</label>
            <input 
              v-model="dogProfile.preferredBreeds" 
              type="text" 
              placeholder="Golden Retriever, Labrador, etc."
            />
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

      <!-- Gallery Tab -->
      <div v-if="activeTab === 'gallery'" class="tab-panel">
        <div class="gallery-section">
          <h3>Photo Gallery</h3>

          <div class="upload-area">
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

            <!-- keep your add-photo tile if you like -->
            <div class="photo-item add-photo" @click="choosePhotos">
              <svg class="add-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              <p>Add Photo</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <div v-if="showMenu" class="nav-menu">
      <div class="nav-overlay" @click="toggleMenu"></div>
      <div class="nav-content">
        <div class="nav-item" @click="goToDiscover">
          <span>Discover Dogs</span>
      </div>
        <div class="nav-item active" @click="toggleMenu">
          <span>Profile</span>
        </div>
        <div class="nav-item" @click="goToMatches">
          <span>Matches</span>
        </div>
        <div class="nav-item" @click="goToSettings">
          <span>Settings</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db, storage } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

const router = useRouter()

// --- existing state ---
const activeTab = ref('basic')
const showMenu = ref(false)
const selectedDogId = ref('1')
const userDogs = ref<any[]>([])

// NEW: current user + gallery state
const currentUser = ref<{ uid: string } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const photos = ref<string[]>([]) // gallery URLs for the selected dog
const saving = ref(false)

// tabs (unchanged)
const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'medical', label: 'Medical Papers' },
  { id: 'training', label: 'Training & Certs' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'gallery', label: 'Gallery' }
]

// dogProfile (your existing object, unchanged)
const dogProfile = reactive({
  name: 'Tango',
  breed: 'Golden Retriever',
  sex: 'male',
  age: '3 years',
  birthday: '2021-01-14',
  weight: '62 pounds',
  weightValue: 62,
  temperament: 'Friendly, energetic, and great with kids',
  location: 'San Francisco, CA',
  trainingLevel: 'intermediate',
  certifications: ['akc'],
  trainingNotes: 'Completed basic obedience training at 6 months. Excellent recall and house trained.',
  lookingFor: 'breeding',
  preferredBreeds: 'Golden Retriever, Labrador',
  minAgePref: 2,
  maxAgePref: 5,
  travelDistance: '50'
})

const setActiveTab = (tabId: string) => { activeTab.value = tabId }
const toggleMenu = () => { showMenu.value = !showMenu.value }

const calculateAge = () => {
  if (dogProfile.birthday) {
    const birthDate = new Date(dogProfile.birthday)
    const today = new Date()
    const ageInYears = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    dogProfile.age = `${ageInYears} years`
  }
}

const updateWeight = () => { dogProfile.weight = `${dogProfile.weightValue} pounds` }

// --- Firestore helpers ---
const dogDocRef = () => {
  if (!currentUser.value) throw new Error('Not signed in')
  if (!selectedDogId.value) throw new Error('No dog selected')
  return doc(db, 'dogs', selectedDogId.value)
}

const loadDogFromFirestore = async () => {
  if (!currentUser.value || !selectedDogId.value) return
  try {
    const snap = await getDoc(dogDocRef())
    if (snap.exists()) {
      const data = snap.data() as any
      // merge known fields and gallery
  Object.assign(dogProfile, {
        name: data.name || '',
        breed: data.breed || '',
        sex: data.sex === 'F' ? 'female' : 'male',
        age: data.age || '',
        birthday: data.birthday || '',
        weight: data.weight || '',
        weightValue: data.weightValue || 50,
        temperament: data.temperament || '',
        location: data.location || '',
        trainingLevel: data.trainingLevel || '',
        certifications: data.certifications || [],
        trainingNotes: data.trainingNotes || '',
        lookingFor: data.lookingFor || '',
        preferredBreeds: data.preferredBreeds || '',
        minAgePref: data.minAgePref || '',
        maxAgePref: data.maxAgePref || '',
        travelDistance: data.travelDistance || '50'
      })
      photos.value = data.gallery || []
    } else {
      // create a stub doc so uploads have a target
    const payload = {
      ownerId: currentUser.value.uid,
      name: dogProfile.name || 'Untitled',
        sex: dogProfile.sex === 'female' ? 'F' : 'M',
        gallery: []
      }
      await setDoc(dogDocRef(), payload, { merge: true })
      photos.value = []
    }
  } catch (e) {
    console.error('loadDogFromFirestore error', e)
  }
}

const saveProfile = async () => {
  try {
    if (!currentUser.value) throw new Error('Sign in to save')
    saving.value = true

    // Include required fields for Firestore rules
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
  } catch (e) {
    console.error('saveProfile error', e)
    alert('Failed to save profile. Check console for details.')
  } finally {
    saving.value = false
  }
}

// --- Upload flow ---
const choosePhotos = () => fileInput.value?.click()

const onFilesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  if (!currentUser.value) { 
    console.warn('No auth user - please sign in first')
    alert('Please sign in to upload photos')
    return 
  }

  console.log('Starting upload for user:', currentUser.value.uid)
  uploading.value = true
  uploadProgress.value = 0

  // upload files sequentially (simpler progress); you can parallelize if you want
  try {
    for (const file of Array.from(input.files)) {
      const path = `dogs/${currentUser.value.uid}/${selectedDogId.value}/gallery/${Date.now()}_${file.name}`
      console.log('Uploading to path:', path)
      const storageRef = sRef(storage, path)
      // const storageRef = sRef(storage, "test.jpg")
      const task = uploadBytesResumable(storageRef, file, { contentType: file.type })
      console.log('Upload task created, starting upload...')

      await new Promise<string>((resolve, reject) => {
      task.on('state_changed',
        (snap) => {
            // overall percent for this file
            uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        },
        (err) => reject(err),
          async () => {
            try {
              const url = await getDownloadURL(task.snapshot.ref)
              // append to Firestore gallery atomically
              await updateDoc(dogDocRef(), { gallery: arrayUnion(url) })
              // reflect in UI immediately
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
    if (fileInput.value) fileInput.value.value = '' // reset input
  }
}

const removePhoto = async (url: string) => {
  if (!currentUser.value) return
  try {
    // delete from storage
    const objectRef = sRef(storage, url)
    await deleteObject(objectRef).catch(() => {
      // If url is a full download URL, deleting via full URL ref will work in latest SDK.
      // If not, you may need to keep and pass the storage path you used above.
    })
  } catch (e) {
    console.warn('deleteObject warning:', e)
  }
  try {
    // remove from Firestore gallery
    const snap = await getDoc(dogDocRef())
    if (snap.exists()) {
      const data = snap.data() as any
      const next = (data.gallery || []).filter((u: string) => u !== url)
      await updateDoc(dogDocRef(), { gallery: next })
    }
  } catch (e) {
    console.error('removePhoto error', e)
  } finally {
    photos.value = photos.value.filter(u => u !== url)
  }
}

// navigation (unchanged)
const goToDiscover = () => { router.push('/discover'); showMenu.value = false }
const goToMatches = () => { router.push('/matches'); showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }

const loadDogProfile = async () => {
  if (selectedDogId.value === 'new') {
  Object.assign(dogProfile, {
    name: '',
    breed: '',
      sex: '',
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
  } else {
    // load from local seed & Firestore
    const dog = userDogs.value.find(d => d.id === selectedDogId.value)
    if (dog) Object.assign(dogProfile, dog)
    await loadDogFromFirestore()
  }
}

onMounted(async () => {
  // seed (as you had)
  userDogs.value = [
    { id: '1', name: 'Tango', breed: 'Golden Retriever', sex: 'male', age: '3 years', birthday: '2021-01-14',
      weight: '62 pounds', weightValue: 62, temperament: 'Friendly, energetic, and great with kids',
      location: 'San Francisco, CA', trainingLevel: 'intermediate', certifications: ['akc'],
      trainingNotes: 'Completed basic obedience training at 6 months. Excellent recall and house trained.',
      lookingFor: 'breeding', preferredBreeds: 'Golden Retriever, Labrador', minAgePref: 2, maxAgePref: 5, travelDistance: '50' },
    { id: '2', name: 'Luna', breed: 'German Shepherd', sex: 'female', age: '2 years', birthday: '2022-03-15',
      weight: '55 pounds', weightValue: 55, temperament: 'Intelligent, protective, and loyal',
      location: 'San Francisco, CA', trainingLevel: 'advanced', certifications: ['akc', 'therapy'],
      trainingNotes: 'Advanced obedience training completed. Therapy dog certified.',
      lookingFor: 'companion', preferredBreeds: 'German Shepherd, Belgian Malinois', minAgePref: 1, maxAgePref: 4, travelDistance: '25' }
  ]

  calculateAge()

  // auth (so Storage/Firestore rules requiring auth will work)
  onAuthStateChanged(auth, async (u) => {
    currentUser.value = u ? { uid: u.uid } : null
    await loadDogProfile()
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

.menu-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-icon {
  width: 24px;
  height: 24px;
}

.dog-selector {
  background: #f8f9fa;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.dog-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.dog-selector select {
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.dog-selector select:focus {
  outline: none;
  border-color: #6A2C4A;
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
  transition: all 0.3s ease;
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
  min-height: calc(100vh - 140px);
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
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
  transition: all 0.3s ease;
  font-weight: 500;
}

.sex-btn.active {
  background: #6A2C4A;
  color: white;
  border-color: #6A2C4A;
}

.age-input-group,
.weight-input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.age-display,
.weight-display {
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

.save-btn {
  background: #6A2C4A;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.save-btn:hover {
  background: #5a253e;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(106, 44, 74, 0.3);
}

.medical-section,
.training-section,
.preferences-section,
.gallery-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.medical-section h3,
.training-section h3,
.preferences-section h3,
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

.certifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
}

.cert-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.cert-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.cert-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.cert-status.verified {
  background: #d4edda;
  color: #155724;
}

.cert-status.pending {
  background: #fff3cd;
  color: #856404;
}

.cert-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin: 0;
  transform: scale(1.2);
}

.preference-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pref-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.pref-btn.active {
  background: #6A2C4A;
  color: white;
  border-color: #6A2C4A;
}

.age-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.age-range input {
  flex: 1;
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
  transition: all 0.3s ease;
}

.add-photo:hover {
  border-color: #6A2C4A;
  background: #f8f9fa;
}

.add-icon {
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
  transition: background-color 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item span {
  font-size: 1.1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .profile-header {
    padding: 1rem;
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
  
  .sex-buttons,
  .preference-buttons {
    flex-direction: column;
  }
  
  .nav-content {
    width: 200px;
  }
}
</style>
