<template>
  <div class="dog-image-test">
    <h3>Dog Image API Test</h3>
    <div class="test-controls">
      <button @click="loadRandomImage" :disabled="loading">
        {{ loading ? 'Loading...' : 'Get Random Dog' }}
      </button>
      <button @click="loadMultipleImages" :disabled="loading">
        {{ loading ? 'Loading...' : 'Get 5 Random Dogs' }}
      </button>
      <button @click="generateFakeProfile" :disabled="loading">
        {{ loading ? 'Generating...' : 'Generate Fake Profile' }}
      </button>
    </div>
    
    <div v-if="images.length > 0" class="image-grid">
      <div v-for="(image, index) in images" :key="index" class="image-item">
        <img :src="image" :alt="`Dog ${index + 1}`" @error="handleImageError" />
      </div>
    </div>
    
    <div v-if="fakeProfile" class="fake-profile">
      <h4>Generated Fake Profile:</h4>
      <div class="profile-card">
        <div class="profile-image">
          <img v-if="fakeProfile.photos && fakeProfile.photos[0]" :src="fakeProfile.photos[0]" alt="Fake dog" />
        </div>
        <div class="profile-info">
          <h5>{{ fakeProfile.name }}</h5>
          <p><strong>Breed:</strong> {{ fakeProfile.breed }}</p>
          <p><strong>Age:</strong> {{ fakeProfile.age }}</p>
          <p><strong>Location:</strong> {{ fakeProfile.location }}</p>
          <p><strong>Temperament:</strong> {{ fakeProfile.temperament }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getRandomDogImage, getMultipleDogImages, generateFakeDogProfile } from '../services/dogImages.js'

const loading = ref(false)
const images = ref([])
const fakeProfile = ref(null)

const loadRandomImage = async () => {
  loading.value = true
  try {
    const image = await getRandomDogImage()
    if (image) {
      images.value = [image]
    }
  } catch (error) {
    console.error('Error loading random image:', error)
  } finally {
    loading.value = false
  }
}

const loadMultipleImages = async () => {
  loading.value = true
  try {
    const imageList = await getMultipleDogImages(5)
    images.value = imageList
  } catch (error) {
    console.error('Error loading multiple images:', error)
  } finally {
    loading.value = false
  }
}

const generateFakeProfile = async () => {
  loading.value = true
  try {
    const profile = await generateFakeDogProfile()
    fakeProfile.value = profile
  } catch (error) {
    console.error('Error generating fake profile:', error)
  } finally {
    loading.value = false
  }
}

const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src)
  event.target.src = 'https://via.placeholder.com/400x500?text=Image+Failed+to+Load'
}
</script>

<style scoped>
.dog-image-test {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.test-controls button {
  background: #6A2C4A;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.test-controls button:hover:enabled {
  background: #5a2438;
  transform: translateY(-1px);
}

.test-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.fake-profile {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.profile-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.profile-image {
  flex-shrink: 0;
}

.profile-image img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.profile-info h5 {
  margin: 0 0 0.5rem 0;
  color: #6A2C4A;
  font-size: 1.25rem;
}

.profile-info p {
  margin: 0.25rem 0;
  color: #666;
}

.profile-info strong {
  color: #333;
}
</style>
