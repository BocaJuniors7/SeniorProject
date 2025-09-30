// Dog Image API Service
const DOG_API_BASE = 'https://dog.ceo/api'

// Get a random dog image
export async function getRandomDogImage() {
  try {
    const response = await fetch(`${DOG_API_BASE}/breeds/image/random`)
    const data = await response.json()
    return data.message // Returns the image URL
  } catch (error) {
    console.error('Error fetching random dog image:', error)
    return null
  }
}

// Get multiple random dog images
export async function getMultipleDogImages(count = 3) {
  try {
    const promises = Array(count).fill().map(() => getRandomDogImage())
    const images = await Promise.all(promises)
    return images.filter(Boolean) // Remove any null values
  } catch (error) {
    console.error('Error fetching multiple dog images:', error)
    return []
  }
}

// Get images for a specific breed
export async function getBreedImages(breed, count = 3) {
  try {
    const response = await fetch(`${DOG_API_BASE}/breed/${breed}/images/random/${count}`)
    const data = await response.json()
    return data.message || []
  } catch (error) {
    console.error(`Error fetching ${breed} images:`, error)
    return []
  }
}

// Alias for the AI profile generator
export async function getRandomDogImagesByBreed(breed, count = 3) {
  return await getBreedImages(breed, count)
}

// Get all available breeds
export async function getAllBreeds() {
  try {
    const response = await fetch(`${DOG_API_BASE}/breeds/list/all`)
    const data = await response.json()
    return Object.keys(data.message)
  } catch (error) {
    console.error('Error fetching breeds:', error)
    return []
  }
}

// Generate fake dog profile with images
export async function generateFakeDogProfile() {
  const breeds = [
    'Golden Retriever', 'Labrador', 'German Shepherd', 'French Bulldog', 
    'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'German Shorthaired Pointer',
    'Yorkshire Terrier', 'Siberian Husky', 'Dachshund', 'Boxer', 'Great Dane'
  ]
  
  const names = [
    'Buddy', 'Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Lucy', 'Rocky',
    'Daisy', 'Milo', 'Lola', 'Bear', 'Sadie', 'Duke', 'Molly', 'Tucker',
    'Maggie', 'Jake', 'Sophie', 'Toby', 'Chloe', 'Zeus', 'Lily', 'Oscar'
  ]
  
  const locations = [
    'San Francisco, CA', 'Los Angeles, CA', 'New York, NY', 'Chicago, IL',
    'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Portland, OR', 'Boston, MA',
    'Miami, FL', 'Phoenix, AZ', 'Dallas, TX', 'Atlanta, GA', 'Nashville, TN'
  ]
  
  const temperaments = [
    'Friendly and energetic, loves to play fetch',
    'Calm and gentle, great with kids',
    'Intelligent and loyal, perfect family dog',
    'Playful and outgoing, loves meeting new people',
    'Sweet and affectionate, loves cuddles',
    'Active and adventurous, loves hiking',
    'Gentle and patient, great therapy dog',
    'Fun-loving and social, loves dog parks'
  ]
  
  const breed = breeds[Math.floor(Math.random() * breeds.length)]
  const name = names[Math.floor(Math.random() * names.length)]
  const location = locations[Math.floor(Math.random() * locations.length)]
  const temperament = temperaments[Math.floor(Math.random() * temperaments.length)]
  const age = Math.floor(Math.random() * 10) + 1
  const weight = Math.floor(Math.random() * 60) + 20
  const sex = Math.random() > 0.5 ? 'male' : 'female'
  
  // Get 2-4 random dog images
  const imageCount = Math.floor(Math.random() * 3) + 2
  const photos = await getMultipleDogImages(imageCount)
  
  return {
    id: `fake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    breed,
    sex,
    age: `${age} years`,
    birthday: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weight: `${weight} pounds`,
    weightValue: weight,
    temperament,
    location,
    trainingLevel: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
    certifications: Math.random() > 0.7 ? ['akc'] : [],
    trainingNotes: 'Well-trained and socialized',
    lookingFor: ['breeding', 'companion', 'both'][Math.floor(Math.random() * 3)],
    preferredBreeds: breeds[Math.floor(Math.random() * breeds.length)],
    minAgePref: Math.floor(Math.random() * 3) + 1,
    maxAgePref: Math.floor(Math.random() * 5) + 3,
    travelDistance: ['25', '50', '100', '200'][Math.floor(Math.random() * 4)],
    photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=500&fit=crop'],
    isFake: true
  }
}

// Generate multiple fake profiles
export async function generateFakeDogProfiles(count = 10) {
  const profiles = []
  for (let i = 0; i < count; i++) {
    const profile = await generateFakeDogProfile()
    profiles.push(profile)
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return profiles
}
