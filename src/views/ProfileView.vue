<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-header">
      <h1>Dog Profiles</h1>
      <div class="header-actions">
       
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

        <!-- Tab Content -->
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

          <!-- Medical Tab -->
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

          <!-- Training Tab -->
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
                <label>Training Notes</label>
                <textarea v-model="dogProfile.trainingNotes" rows="4" placeholder="Describe training history and special skills..."></textarea>
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
                  <button type="button" :class="['pref-btn', { active: dogProfile.lookingFor === 'breeding' }]" @click="dogProfile.lookingFor = 'breeding'">Breeding Partner</button>
                  <button type="button" :class="['pref-btn', { active: dogProfile.lookingFor === 'companion' }]" @click="dogProfile.lookingFor = 'companion'">Companion</button>
                  <button type="button" :class="['pref-btn', { active: dogProfile.lookingFor === 'both' }]" @click="dogProfile.lookingFor = 'both'">Both</button>
                </div>
              </div>
              <div class="form-group">
                <label>Preferred Breeds</label>
                <input v-model="dogProfile.preferredBreeds" type="text" placeholder="Golden Retriever, Labrador, etc." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Preview Modal -->
    <ProfilePreview
      v-if="showPreview"
      :profile="previewDogData || dogProfile"
      :photos="previewPhotos.length ? previewPhotos : photos"
      @close="showPreview = false"
      @edit="() => { showPreview = false; activeTab = 'basic' }"
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// If your alias isn't set, change '@/firebase' -> '../firebase'
import { auth, db, storage } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  addDoc, collection, doc, getDoc, getDocs,
  query, setDoc, updateDoc, where, arrayUnion, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import ProfilePreview from '../components/ProfilePreview.vue'

const router = useRouter()

/* ---------- State ---------- */
const showMenu = ref(false)
const editingProfile = ref<any | null>(null)
const showPreview = ref(false)
const previewDogData = ref<any | null>(null)
const previewPhotos = ref<string[]>([])
const activeTab = ref<'basic' | 'medical' | 'training' | 'preferences' | 'gallery'>('basic')
const saving = ref(false)
const currentUser = ref<{ uid: string } | null>(null)
const userDogs = ref<any[]>([])
const deletingId = ref<string | null>(null)

/* Upload state */
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const photos = ref<string[]>([])

/* Dog profile form model */
const dogProfile = reactive<any>({
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

/* ---------- UI helpers ---------- */
const toggleMenu = () => { showMenu.value = !showMenu.value }
const setActiveTab = (tabId: any) => { activeTab.value = tabId }

const calculateAge = () => {
  if (dogProfile.birthday) {
    const birthDate = new Date(dogProfile.birthday)
    const today = new Date()
    const ageInYears = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    dogProfile.age = `${ageInYears} years`
  }
}
const updateWeight = () => { dogProfile.weight = `${dogProfile.weightValue} pounds` }

/* ---------- Firestore + profile logic (unchanged) ---------- */
/* ... keep all your addNewDog, editDog, previewDog, saveProfile, fetchDogs,
   deleteDogById, choosePhotos, onFilesSelected, removePhoto, handleDrop etc. exactly as you have them ... */

/* ---------- Navigation ---------- */
const goToDiscover = () => { router.push('/discover'); showMenu.value = false }
const goToMatches = () => { router.push('/matches'); showMenu.value = false }
const goToSettings = () => { router.push('/settings'); showMenu.value = false }

/* ---------- Init + Auth Redirect ---------- */
let unsubscribeAuth: (() => void) | null = null

onMounted(async () => {
  unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
    if (!u) {
      currentUser.value = null
      userDogs.value = []
      router.replace('/')   // 🚨 bounce home if signed out
    } else {
      currentUser.value = { uid: u.uid }
      await fetchDogs()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth()
})
</script>


<style scoped>
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
.danger-btn { background: #fff0f0; color: #fff; color: #c0392b; border: 1px solid #f5c6cb; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 700; }

.tab-navigation { background: #e9ecef; display: flex; padding: 0 2rem; border-bottom: 1px solid #dee2e6; }
.tab-btn { background: none; border: none; padding: 1rem 1.5rem; cursor: pointer; color: #6c757d; font-weight: 500; border-bottom: 3px solid transparent; transition: all 0.3s; }
.tab-btn.active { background: white; color: #333; border-bottom-color: #6A2C4A; border-radius: 8px 8px 0 0; }
.tab-btn:hover:not(.active) { color: #6A2C4A; }

.tab-content { background: white; min-height: 500px; padding: 2rem; }
.tab-panel { max-width: 600px; margin: 0 auto; }
.profile-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; }
.form-group label { font-weight: 600; color: #333; margin-bottom: 0.5rem; }
.form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #6A2C4A; }

.sex-buttons { display: flex; gap: 0.5rem; }
.sex-btn { flex: 1; padding: 0.75rem; border: 2px solid #e9ecef; background: white; border-radius: 25px; cursor: pointer; transition: all 0.3s; font-weight: 500; }
.sex-btn.active { background: #6A2C4A; color: white; border-color: #6A2C4A; }

.age-input-group, .weight-input-group { display: flex; flex-direction: column; gap: 1rem; }
.age-display, .weight-display { background: #f8f9fa; color: #666; }
.control-label { font-size: 0.9rem; color: #666; margin-bottom: 0.25rem; }
.date-input { width: 100%; }
.weight-slider { width: 100%; height: 6px; border-radius: 3px; background: #e9ecef; outline: none; -webkit-appearance: none; }
.weight-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #6A2C4A; cursor: pointer; }
.weight-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #6A2C4A; cursor: pointer; border: none; }

.gallery-section, .medical-section, .training-section, .preferences-section { display: flex; flex-direction: column; gap: 2rem; }
.gallery-section h3, .medical-section h3, .training-section h3, .preferences-section h3 { color: #333; margin: 0; font-size: 1.5rem; }
.upload-area { border: 2px dashed #e9ecef; border-radius: 12px; padding: 2rem; text-align: center; background: #f8f9fa; }
.upload-box { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.upload-icon { width: 48px; height: 48px; color: #6c757d; }
.upload-btn { background: #6A2C4A; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500; }

.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
.photo-item { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: #f8f9fa; border: 2px solid #e9ecef; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; }
.remove-photo { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.add-photo { display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
.add-photo:hover { border-color: #6A2C4A; background: #f8f9fa; }
.add-photo .add-icon { width: 32px; height: 32px; color: #6c757d; margin-bottom: 0.5rem; }

.preference-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.pref-btn { padding: 0.75rem 1rem; border: 2px solid #e9ecef; background: white; border-radius: 25px; cursor: pointer; transition: all 0.3s; font-weight: 500; }
.pref-btn.active { background: #6A2C4A; color: white; border-color: #6A2C4A; }

.nav-menu { position: fixed; top: 0; right: 0; width: 100%; height: 100%; z-index: 200; }
.nav-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.nav-content { position: absolute; top: 0; right: 0; width: 250px; height: 100%; background: #6A2C4A; padding: 2rem 0; }
.nav-item { padding: 1rem 2rem; color: white; cursor: pointer; transition: background-color 0.3s; }
.nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); }
.nav-item span { font-size: 1.1rem; font-weight: 500; }

@media (max-width: 768px) {
  .main-content { padding: 1rem; }
  .dog-cards { grid-template-columns: 1fr; }
  .edit-header { padding: 1rem; flex-direction: column; gap: 1rem; align-items: flex-start; }
  .tab-navigation { padding: 0 1rem; overflow-x: auto; }
  .tab-btn { padding: 0.75rem 1rem; white-space: nowrap; }
  .tab-content { padding: 1rem; }
  .sex-buttons, .preference-buttons { flex-direction: column; }
  .nav-content { width: 200px; }
}
</style>
