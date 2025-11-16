<template>
  <div class="preview-wrap">
    <!-- Mobile-like viewport -->
    <div class="phone-frame">
      <div class="stage">
        <!-- Scrollable Profile Card -->
        <div class="profile-card">
          <!-- Close Button -->
          <button class="close-btn" @click="$emit('close')" aria-label="Close preview">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
          <!-- Photo Gallery Section -->
          <div class="photo-section">
            <div class="photo-carousel" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
              <div class="photo-track" :style="photoTrackStyle">
                <div v-for="(photo, index) in photos" :key="index" class="photo-slide">
                  <img :src="photo" :alt="`${profile.name} photo ${index + 1}`" />
                </div>
                <!-- Fallback if no photos -->
                <div v-if="photos.length === 0" class="photo-slide placeholder">
                  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/></svg>
                  <span>No photos yet</span>
                </div>
              </div>
            </div>
            
            <!-- Photo indicators -->
            <div v-if="photos.length > 1" class="photo-indicators">
              <span v-for="(photo, index) in photos" :key="index" 
                    :class="['indicator', { active: index === currentPhotoIndex }]"
                    @click="goToPhoto(index)">
              </span>
            </div>
          </div>

          <!-- Basic Info Section -->
          <div class="info-section">
            <div class="name-age">
              <h2>{{ profile.name }}<span v-if="ageDisplay">, {{ ageDisplay }}</span></h2>
              <p class="breed-location">{{ profile.breed }} • {{ profile.location || 'Location not set' }}</p>
            </div>
            
            <div class="basic-details">
              <div class="detail-item">
                <span class="label">Sex</span>
                <span class="value">{{ sexDisplay }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Weight</span>
                <span class="value">{{ weightDisplay }}</span>
              </div>
            </div>
          </div>

          <!-- Temperament Section -->
          <div v-if="profile.temperament" class="content-section">
            <h3>About {{ profile.name }}</h3>
            <p class="temperament">{{ profile.temperament }}</p>
          </div>

          <!-- Training & Certifications Section -->
          <div v-if="hasTrainingInfo" class="content-section">
            <h3>Training & Certifications</h3>
            <div v-if="profile.trainingLevel" class="training-level">
              <span class="label">Training Level:</span>
              <span class="value">{{ trainingLevelDisplay }}</span>
            </div>
            <div v-if="profile.certifications && profile.certifications.length > 0" class="certifications">
              <span class="label">Certifications:</span>
              <div class="cert-badges">
                <span v-for="cert in profile.certifications" :key="cert" class="cert-badge">
                  {{ certDisplay(cert) }}
                </span>
              </div>
            </div>
            <div v-if="profile.trainingNotes" class="training-notes">
              <p>{{ profile.trainingNotes }}</p>
            </div>
          </div>

          <!-- Medical Papers Section -->
          <div v-if="profile.medicalPapers && profile.medicalPapers.length > 0" class="content-section">
            <h3>Health Certifications</h3>
            <div class="medical-papers">
              <div v-for="(paper, index) in profile.medicalPapers" :key="index" class="paper-item">
                <div class="paper-icon">📄</div>
                <div class="paper-info">
                  <span class="paper-name">{{ paper.name || 'Health Certificate' }}</span>
                  <span class="paper-date">{{ paper.date || 'Date not specified' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Preferences Section -->
          <div v-if="hasPreferences" class="content-section">
            <h3>Breeding Preferences</h3>
            <div v-if="profile.lookingFor" class="preference-item">
              <span class="label">Looking for:</span>
              <span class="value">{{ lookingForDisplay }}</span>
            </div>
            <div v-if="profile.preferredBreeds" class="preference-item">
              <span class="label">Preferred breeds:</span>
              <span class="value">{{ profile.preferredBreeds }}</span>
            </div>
            <div v-if="profile.minAgePref || profile.maxAgePref" class="preference-item">
              <span class="label">Age preference:</span>
              <span class="value">{{ agePreferenceDisplay }}</span>
            </div>
            <div v-if="profile.travelDistance" class="preference-item">
              <span class="label">Willing to travel:</span>
              <span class="value">{{ profile.travelDistance }} miles</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Profile {
  name: string
  breed?: string
  sex?: 'male' | 'female' | 'M' | 'F' | ''
  age?: string | number
  birthday?: string
  weight?: string
  weightValue?: number
  temperament?: string
  location?: string
  trainingLevel?: string
  certifications?: string[]
  trainingNotes?: string
  lookingFor?: string
  preferredBreeds?: string
  minAgePref?: string | number
  maxAgePref?: string | number
  travelDistance?: string
  medicalPapers?: Array<{ name?: string; date?: string; url?: string }>
}

const props = defineProps<{
  profile: Profile
  photos?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
}>()

// Photo carousel functionality
const photos = computed(() => props.photos?.filter(Boolean) ?? [])
const currentPhotoIndex = ref(0)
const photoTrackStyle = computed(() => ({
  transform: `translateX(-${currentPhotoIndex.value * 100}%)`
}))

function goToPhoto(index: number) {
  currentPhotoIndex.value = index
}

// Touch/swipe handling for photo carousel
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault() // Prevent scrolling
}

function onTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  
  // Only handle horizontal swipes
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0 && currentPhotoIndex.value > 0) {
      // Swipe right - previous photo
      currentPhotoIndex.value--
    } else if (deltaX < 0 && currentPhotoIndex.value < photos.value.length - 1) {
      // Swipe left - next photo
      currentPhotoIndex.value++
    }
  }
}

// Computed properties for display
const ageDisplay = computed(() => {
  if (typeof props.profile.age === 'number') return `${props.profile.age} years`
  return props.profile.age || ''
})

const sexDisplay = computed(() => {
  const sex = props.profile.sex
  if (!sex) return 'Not specified'
  if (sex === 'male' || sex === 'M') return 'Male'
  if (sex === 'female' || sex === 'F') return 'Female'
  return sex
})

const weightDisplay = computed(() => {
  if (props.profile.weight) return props.profile.weight
  if (props.profile.weightValue) return `${props.profile.weightValue} lbs`
  return 'Not specified'
})

const trainingLevelDisplay = computed(() => {
  const level = props.profile.trainingLevel
  if (!level) return 'Not specified'
  return level.charAt(0).toUpperCase() + level.slice(1)
})

const lookingForDisplay = computed(() => {
  const looking = props.profile.lookingFor
  if (!looking) return 'Not specified'
  return looking.charAt(0).toUpperCase() + looking.slice(1)
})

const agePreferenceDisplay = computed(() => {
  const min = props.profile.minAgePref
  const max = props.profile.maxAgePref
  if (!min && !max) return 'No preference'
  if (min && max) return `${min}-${max} years`
  if (min) return `${min}+ years`
  if (max) return `Up to ${max} years`
  return 'Not specified'
})

const certDisplay = (cert: string) => {
  const certMap: Record<string, string> = {
    'akc': 'AKC Registered',
    'therapy': 'Therapy Dog Certified',
    'service': 'Service Dog Trained',
    'cpr': 'CPR Certified',
    'obedience': 'Obedience Trained'
  }
  return certMap[cert.toLowerCase()] || cert
}

const hasTrainingInfo = computed(() => {
  return props.profile.trainingLevel || 
         (props.profile.certifications && props.profile.certifications.length > 0) ||
         props.profile.trainingNotes
})

const hasPreferences = computed(() => {
  return props.profile.lookingFor ||
         props.profile.preferredBreeds ||
         props.profile.minAgePref ||
         props.profile.maxAgePref ||
         props.profile.travelDistance
})

</script>

<style scoped>
.preview-wrap {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.stage {
  width: 350px;
  height: 600px;
  position: relative;
  background: #f8f9fa;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* Scrollable Profile Card */
.profile-card {
  width: 100%;
  height: 100%;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.profile-card::-webkit-scrollbar {
  display: none;
}

/* Photo Section */
.photo-section {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.photo-carousel {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.photo-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.photo-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.photo-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-slide.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #6c757d;
}

.photo-slide.placeholder svg {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
}

.photo-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

/* Info Section */
.info-section {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.name-age h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}

.breed-location {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1rem;
}

.basic-details {
  display: flex;
  gap: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item .value {
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

/* Content Sections */
.content-section {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.content-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.temperament {
  margin: 0;
  line-height: 1.5;
  color: #555;
}

/* Training Section */
.training-level,
.certifications,
.training-notes {
  margin-bottom: 1rem;
}

.training-level:last-child,
.certifications:last-child,
.training-notes:last-child {
  margin-bottom: 0;
}

.cert-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.cert-badge {
  background: #6A2C4A;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.training-notes p {
  margin: 0;
  line-height: 1.5;
  color: #555;
}

/* Medical Papers */
.medical-papers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.paper-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.paper-icon {
  font-size: 1.5rem;
}

.paper-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.paper-name {
  font-weight: 600;
  color: #333;
}

.paper-date {
  font-size: 0.8rem;
  color: #666;
}

/* Preferences */
.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.preference-item:last-child {
  margin-bottom: 0;
}

.preference-item .label {
  color: #666;
  font-size: 0.9rem;
}

.preference-item .value {
  color: #333;
  font-weight: 600;
  text-align: right;
}


/* Responsive */
@media (max-width: 768px) {
  .preview-wrap {
    padding: 1rem;
  }
  
  .stage {
    width: 300px;
    height: 500px;
  }
  
  .photo-section {
    height: 300px;
  }
  
  .basic-details {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
