// AI Dog Profile Generator Service
import { getRandomDogImagesByBreed } from './dogImages.js'

// Breed-specific personality and characteristics data
const breedData = {
  'goldenretriever': {
    displayName: 'Golden Retriever',
    temperament: 'Friendly, intelligent, and devoted. Great with families and children.',
    commonTraits: ['loyal', 'gentle', 'energetic', 'patient'],
    trainingLevel: ['basic', 'intermediate', 'advanced'],
    commonCertifications: ['akc', 'therapy'],
    size: 'large',
    energyLevel: 'high'
  },
  'labrador': {
    displayName: 'Labrador',
    temperament: 'Outgoing, active, and friendly. Excellent family dogs and working companions.',
    commonTraits: ['loyal', 'energetic', 'intelligent', 'social'],
    trainingLevel: ['basic', 'intermediate', 'advanced'],
    commonCertifications: ['akc', 'therapy', 'service'],
    size: 'large',
    energyLevel: 'high'
  },
  'germanshepherd': {
    displayName: 'German Shepherd',
    temperament: 'Confident, courageous, and smart. Natural protectors and working dogs.',
    commonTraits: ['loyal', 'protective', 'intelligent', 'confident'],
    trainingLevel: ['intermediate', 'advanced', 'professional'],
    commonCertifications: ['akc', 'service', 'therapy'],
    size: 'large',
    energyLevel: 'high'
  },
  'frenchbulldog': {
    displayName: 'French Bulldog',
    temperament: 'Adaptable, playful, and smart. Perfect apartment dogs with big personalities.',
    commonTraits: ['playful', 'adaptable', 'affectionate', 'stubborn'],
    trainingLevel: ['basic', 'intermediate'],
    commonCertifications: ['akc'],
    size: 'small',
    energyLevel: 'medium'
  },
  'bulldog': {
    displayName: 'Bulldog',
    temperament: 'Calm, friendly, and courageous. Gentle giants with a laid-back attitude.',
    commonTraits: ['calm', 'friendly', 'courageous', 'gentle'],
    trainingLevel: ['basic', 'intermediate'],
    commonCertifications: ['akc'],
    size: 'medium',
    energyLevel: 'low'
  },
  'poodle': {
    displayName: 'Poodle',
    temperament: 'Active, alert, and intelligent. Highly trainable and hypoallergenic.',
    commonTraits: ['intelligent', 'active', 'alert', 'trainable'],
    trainingLevel: ['intermediate', 'advanced', 'professional'],
    commonCertifications: ['akc', 'therapy'],
    size: 'medium',
    energyLevel: 'high'
  },
  'beagle': {
    displayName: 'Beagle',
    temperament: 'Friendly, curious, and merry. Great family dogs with a love for adventure.',
    commonTraits: ['friendly', 'curious', 'merry', 'adventurous'],
    trainingLevel: ['basic', 'intermediate'],
    commonCertifications: ['akc'],
    size: 'medium',
    energyLevel: 'high'
  },
  'rottweiler': {
    displayName: 'Rottweiler',
    temperament: 'Loyal, confident, and courageous. Natural guardians with a calm demeanor.',
    commonTraits: ['loyal', 'confident', 'courageous', 'calm'],
    trainingLevel: ['intermediate', 'advanced', 'professional'],
    commonCertifications: ['akc', 'service'],
    size: 'large',
    energyLevel: 'medium'
  },
  'husky': {
    displayName: 'Siberian Husky',
    temperament: 'Mischievous, loyal, and outgoing. Independent spirits with striking looks.',
    commonTraits: ['mischievous', 'loyal', 'outgoing', 'independent'],
    trainingLevel: ['basic', 'intermediate'],
    commonCertifications: ['akc'],
    size: 'large',
    energyLevel: 'very-high'
  },
  'dachshund': {
    displayName: 'Dachshund',
    temperament: 'Clever, lively, and courageous. Small dogs with big personalities.',
    commonTraits: ['clever', 'lively', 'courageous', 'stubborn'],
    trainingLevel: ['basic', 'intermediate'],
    commonCertifications: ['akc'],
    size: 'small',
    energyLevel: 'medium'
  }
}

// AI-generated names by breed
const breedNames = {
  'goldenretriever': ['Sunny', 'Honey', 'Amber', 'Rusty', 'Goldie', 'Blaze', 'Copper', 'Sandy'],
  'labrador': ['Buddy', 'Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Lucy', 'Rocky'],
  'germanshepherd': ['Zeus', 'Luna', 'Thor', 'Athena', 'Apollo', 'Nova', 'Koda', 'Sasha'],
  'frenchbulldog': ['Pierre', 'Belle', 'Gigi', 'Marcel', 'Sophie', 'Louis', 'Coco', 'Henri'],
  'bulldog': ['Winston', 'Bella', 'Duke', 'Princess', 'Tank', 'Ruby', 'Brutus', 'Pearl'],
  'poodle': ['Sophie', 'Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Lucy', 'Rocky'],
  'beagle': ['Buddy', 'Bella', 'Max', 'Lucy', 'Charlie', 'Luna', 'Cooper', 'Sadie'],
  'rottweiler': ['Zeus', 'Luna', 'Thor', 'Athena', 'Apollo', 'Nova', 'Koda', 'Sasha'],
  'husky': ['Luna', 'Zeus', 'Nova', 'Koda', 'Sasha', 'Apollo', 'Athena', 'Thor'],
  'dachshund': ['Oscar', 'Bella', 'Max', 'Lucy', 'Charlie', 'Luna', 'Cooper', 'Sadie']
}

// Training notes templates
const trainingNotes = [
  'Well-socialized from a young age with other dogs and people.',
  'Completed basic obedience training and responds well to commands.',
  'Has been through professional training programs and is very well-behaved.',
  'Naturally well-mannered and easy to train. Loves learning new tricks.',
  'Has experience with advanced training techniques and is very responsive.',
  'Socialized with children and other pets. Very gentle and patient.',
  'Trained for specific tasks and has excellent focus and discipline.',
  'Natural working dog instincts with proper training and guidance.'
]

// Location data
const locations = [
  'San Francisco, CA', 'Los Angeles, CA', 'New York, NY', 'Chicago, IL',
  'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Portland, OR', 'Boston, MA',
  'Miami, FL', 'Phoenix, AZ', 'Dallas, TX', 'Atlanta, GA', 'Nashville, TN',
  'Las Vegas, NV', 'Orlando, FL', 'San Diego, CA', 'Houston, TX'
]

// Generate a single AI dog profile
export async function generateAIDogProfile() {
  try {
    // Select a random breed
    const breeds = Object.keys(breedData)
    const selectedBreed = breeds[Math.floor(Math.random() * breeds.length)]
    const breedInfo = breedData[selectedBreed]
    
    // Generate name from breed-specific names
    const breedNameList = breedNames[selectedBreed] || ['Buddy', 'Bella', 'Max', 'Lucy', 'Charlie']
    const name = breedNameList[Math.floor(Math.random() * breedNameList.length)]
    
    // Generate age (1-10 years)
    const age = Math.floor(Math.random() * 10) + 1
    
    // Generate weight based on breed size
    let weight
    switch (breedInfo.size) {
      case 'small':
        weight = Math.floor(Math.random() * 20) + 10 // 10-30 lbs
        break
      case 'medium':
        weight = Math.floor(Math.random() * 30) + 30 // 30-60 lbs
        break
      case 'large':
        weight = Math.floor(Math.random() * 50) + 50 // 50-100 lbs
        break
      default:
        weight = Math.floor(Math.random() * 40) + 30 // 30-70 lbs
    }
    
    // Generate sex
    const sex = Math.random() > 0.5 ? 'male' : 'female'
    
    // Generate training level based on breed
    const trainingLevel = breedInfo.trainingLevel[Math.floor(Math.random() * breedInfo.trainingLevel.length)]
    
    // Generate certifications (some breeds more likely to have them)
    const certifications = []
    if (Math.random() > 0.6) { // 40% chance of having certifications
      const possibleCerts = breedInfo.commonCertifications
      const numCerts = Math.floor(Math.random() * possibleCerts.length) + 1
      for (let i = 0; i < numCerts; i++) {
        const cert = possibleCerts[Math.floor(Math.random() * possibleCerts.length)]
        if (!certifications.includes(cert)) {
          certifications.push(cert)
        }
      }
    }
    
    // Generate training notes
    const trainingNote = trainingNotes[Math.floor(Math.random() * trainingNotes.length)]
    
    // Generate preferences
    const lookingForOptions = ['breeding', 'companion', 'both']
    const lookingFor = lookingForOptions[Math.floor(Math.random() * lookingForOptions.length)]
    
    // Generate preferred breeds (different from own breed)
    const otherBreeds = breeds.filter(b => b !== selectedBreed)
    const numPreferredBreeds = Math.floor(Math.random() * 3) + 1
    const preferredBreeds = []
    for (let i = 0; i < numPreferredBreeds; i++) {
      const breed = otherBreeds[Math.floor(Math.random() * otherBreeds.length)]
      const displayBreed = breedData[breed].displayName
      if (!preferredBreeds.includes(displayBreed)) {
        preferredBreeds.push(displayBreed)
      }
    }
    
    // Generate age preferences
    const minAgePref = Math.floor(Math.random() * 3) + 1
    const maxAgePref = minAgePref + Math.floor(Math.random() * 5) + 2
    
    // Generate travel distance
    const travelDistances = ['25', '50', '100', '200']
    const travelDistance = travelDistances[Math.floor(Math.random() * travelDistances.length)]
    
    // Generate location
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    // Get breed-specific images
    let photos = []
    try {
      const imageUrls = await getRandomDogImagesByBreed(selectedBreed, 3)
      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        photos = imageUrls.map(url => ({
          id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
          url: url,
          storagePath: `ai_generated/${selectedBreed.toLowerCase().replace(/\s+/g, '_')}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
        }))
      } else {
        throw new Error('No images returned from API')
      }
    } catch (error) {
      console.warn('Failed to get breed-specific images, using fallback:', error)
      // Fallback to random images
      photos = [{
        id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
        url: `https://picsum.photos/400/500?random=${Math.random()}`,
        storagePath: `ai_generated/fallback/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      }]
    }
    
    // Generate medical papers (30% chance)
    const medicalPapers = []
    if (Math.random() > 0.7) {
      const paperTypes = ['Health Certificate', 'Vaccination Record', 'Breeding License', 'Genetic Testing']
      const numPapers = Math.floor(Math.random() * 2) + 1
      for (let i = 0; i < numPapers; i++) {
        medicalPapers.push({
          name: paperTypes[Math.floor(Math.random() * paperTypes.length)],
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          url: `https://example.com/medical/${Math.random().toString(36).slice(2)}.pdf`
        })
      }
    }
    
    // Create the profile object
    const profile = {
      name: name,
      breed: breedInfo.displayName,
      sex: sex === 'male' ? 'M' : 'F',
      age: `${age} years`,
      birthday: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weight: `${weight} pounds`,
      weightValue: weight,
      temperament: breedInfo.temperament,
      location: location,
      trainingLevel: trainingLevel,
      certifications: certifications,
      trainingNotes: trainingNote,
      lookingFor: lookingFor,
      preferredBreeds: preferredBreeds.join(', '),
      minAgePref: minAgePref.toString(),
      maxAgePref: maxAgePref.toString(),
      travelDistance: travelDistance,
      photos: photos,
      medicalPapers: medicalPapers,
      isAIGenerated: true,
      generatedAt: new Date().toISOString()
    }
    
    return profile
    
  } catch (error) {
    console.error('Error generating AI dog profile:', error)
    throw error
  }
}

// Generate multiple AI dog profiles
export async function generateMultipleAIDogProfiles(count = 5) {
  const profiles = []
  for (let i = 0; i < count; i++) {
    try {
      const profile = await generateAIDogProfile()
      profiles.push(profile)
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error generating profile ${i + 1}:`, error)
    }
  }
  return profiles
}
