<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="paw-icon">
          <svg viewBox="0 0 100 100" class="paw-svg">
            <!-- Main paw pad (heart-shaped) -->
            <path d="M50 85 C38 85, 32 75, 32 65 C32 55, 35 50, 38 50 C41 50, 44 55, 50 60 C56 55, 59 50, 62 50 C65 50, 68 55, 68 65 C68 75, 62 85, 50 85 Z" fill="#6A2C4A"/>
            <!-- Four toe pads in arc -->
            <ellipse cx="30" cy="35" rx="7" ry="10" fill="#6A2C4A"/>
            <ellipse cx="41.5" cy="25" rx="7" ry="10" fill="#6A2C4A"/>
            <ellipse cx="58.5" cy="25" rx="7" ry="10" fill="#6A2C4A"/>
            <ellipse cx="70" cy="35" rx="7" ry="10" fill="#6A2C4A"/>
          </svg>
        </div>
        <h1 class="hero-title">Welcome to PawMatch</h1>
        <p class="hero-subtitle">A matchmaker for breeders connecting their pups.</p>
        <div class="cta-buttons">
          <router-link to="/signup" class="btn btn-primary">Sign Up</router-link>
          <router-link to="/login" class="btn btn-primary">Login</router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2>Why Choose PawMatch?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🐕</div>
            <h3>Find Perfect Matches</h3>
            <p>Swipe through verified dog profiles to find the perfect breeding partner or companion.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Health Certifications</h3>
            <p>View health records and certifications to ensure healthy breeding practices.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>Verified Breeders</h3>
            <p>Connect with trusted breeders who prioritize the health and wellbeing of their dogs.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// No additional logic needed for the home page
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
  animation: float 20s infinite linear;
}

@keyframes float {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-100px); }
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.paw-icon {
  margin-bottom: 2rem;
}

.paw-svg {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-block;
  min-width: 140px;
}

.btn-primary {
  background: #6A2C4A;
  color: white;
  border: 2px solid #6A2C4A;
}

.btn-primary:hover {
  background: #5a253e;
  border-color: #5a253e;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(106, 44, 74, 0.3);
}

.features {
  padding: 4rem 2rem;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 15px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-color: #6A2C4A;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #6A2C4A;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* iPhone 14 and similar mobile devices */
@media (max-width: 428px) {
  .hero {
    padding: 2rem 1rem;
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .paw-svg {
    width: 80px;
    height: 80px;
  }
  
  .hero-title {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .btn {
    width: 100%;
    max-width: 280px;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  .features {
    padding: 2rem 1rem;
  }
  
  .features h2 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .feature-icon {
    font-size: 2.5rem;
  }
  
  .feature-card h3 {
    font-size: 1.25rem;
  }
}

/* Tablet and larger mobile devices */
@media (min-width: 429px) and (max-width: 768px) {
  .hero {
    padding: 3rem 2rem;
  }
  
  .hero-title {
    font-size: 2.2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .cta-buttons {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
  
  .btn {
    width: auto;
    min-width: 140px;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

/* Desktop and larger screens */
@media (min-width: 769px) {
  .hero {
    padding: 4rem 2rem;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
