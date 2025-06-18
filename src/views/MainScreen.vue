<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const store = useUserStore();

const clothes = ref([]);
const outfits = ref([]);
const isLoading = ref(false);

// Computed properties for stats
const totalClothes = computed(() => clothes.value.length);
const totalOutfits = computed(() => outfits.value.length);
const recentClothes = computed(() => clothes.value.slice(-4).reverse());
const recentOutfits = computed(() => outfits.value.slice(-3).reverse());

// Fetch user data when authenticated
onMounted(() => {
  if (store.isAuthenticated) {
    fetchUserData();
  }
});

// Fetch clothes and outfits for dashboard
const fetchUserData = async () => {
  if (!store.isAuthenticated || !store.currentUser) return;

  isLoading.value = true;

  try {
    // Fetch clothes
    const clothesResponse = await fetch(`https://87bb0d4c94472c27.mokky.dev/clothes?users_id=${store.currentUser.id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (clothesResponse.ok) {
      const clothesData = await clothesResponse.json();
      clothes.value = clothesData.filter(item => item.users_id === store.currentUser.id);
    }

    // Fetch outfits
    const outfitsResponse = await fetch(`https://87bb0d4c94472c27.mokky.dev/outfits?users_id=${store.currentUser.id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (outfitsResponse.ok) {
      const outfitsData = await outfitsResponse.json();
      outfits.value = outfitsData.filter(item => item.users_id === store.currentUser.id);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Navigation functions
const navigateToClothes = () => router.push('/clothes');
const navigateToOutfits = () => router.push('/outfits');
const navigateToClothesAdd = () => router.push('/clothesAdd');
const navigateToOutfitsAdd = () => router.push('/outfitsAdd');
const navigateToRegister = () => router.push('/register');
const navigateToLogin = () => router.push('/login');
</script>

<template>
  <div class="main-screen">

    <!-- Non-authenticated user view -->
    <div v-if="!store.isAuthenticated" class="welcome-section">
      <div class="hero defShadow">
        <h1>Добро пожаловать!</h1>
        <p class="hero-description">
          Организуйте свой гардероб и создавайте стильные образы с легкостью
        </p>

        <div class="features-grid">
          <div class="feature-card defShadow">
            <div class="feature-icon">👗</div>
            <h3>Управление гардеробом</h3>
            <p>Добавляйте, сортируйте и фильтруйте свою одежду по сезонам, стилям и размерам</p>
          </div>

          <div class="feature-card defShadow">
            <div class="feature-icon">✨</div>
            <h3>Создание аутфитов</h3>
            <p>Комбинируйте вещи из своего гардероба и создавайте готовые образы на любой случай</p>
          </div>
        </div>

        <div class="cta-buttons">
          <button @click="navigateToRegister" class="button cta-primary">
            Начать использование
          </button>
          <button @click="navigateToLogin" class="button cta-secondary">
            Уже есть аккаунт? Войти
          </button>
        </div>
      </div>
    </div>

    <!-- Authenticated user dashboard -->
    <div v-else class="dashboard">
      <div class="welcome-back">
        <h2>Добро пожаловать, {{ store.currentUser.name }}!</h2>
        <p>Готовы создать новый стильный образ?</p>
      </div>

      <!-- Quick Stats -->
      <div class="stats-section">
        <div class="stat-card defShadow">
          <div class="stat-icon"><img src="../assets/images/Book.svg" alt="Clothes"></div>
          <div class="stat-content">
            <div class="stat-number">{{ totalClothes }}</div>
            <div class="stat-label">Вещей в гардеробе</div>
          </div>
        </div>

        <div class="stat-card defShadow">
          <div class="stat-icon"><img src="../assets/images/Rarity.svg" alt="Outfits"></div>
          <div class="stat-content">
            <div class="stat-number">{{ totalOutfits }}</div>
            <div class="stat-label">Готовых аутфитов</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions defShadow">
        <h3>Быстрые действия</h3>
        <div class="action-buttons">
          <button @click="navigateToClothesAdd" class="button action-btn primary">
            <span class="btn-icon"><img src="../assets/images/upload.svg" alt="Add"></span>
            Добавить одежду
          </button>
          <button @click="navigateToOutfitsAdd" class="button action-btn secondary">
            <span class="btn-icon">🎨</span>
            Создать аутфит
          </button>
          <button @click="navigateToClothes" class="button action-btn tertiary">
            <span class="btn-icon">👗</span>
            Мой гардероб
          </button>
          <button @click="navigateToOutfits" class="button action-btn tertiary">
            <span class="btn-icon">✨</span>
            Мои аутфиты
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-section">
        <!-- Recent Clothes -->
        <div v-if="recentClothes.length > 0" class="recent-clothes defShadow">
          <div class="section-header">
            <h3>Недавно добавленная одежда</h3>
            <button @click="navigateToClothes" class="button view-all-btn">
              Смотреть все
            </button>
          </div>

          <div class="recent-grid">
            <div
                v-for="item in recentClothes"
                :key="item.id"
                class="recent-item defShadow"
                @click="navigateToClothes"
            >
              <div class="item-image-container">
                <img
                    :src="item.imageUrl"
                    :alt="item.name"
                    class="item-image"
                    @error="$event.target.src = '/placeholder-image.jpg'"
                />
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-details">
                  <span v-if="item.size" class="item-size">{{ item.size }}</span>
                  <span v-if="item.seasons && item.seasons.length > 0" class="item-season">
                    {{ item.seasons[0] }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Outfits -->
        <div v-if="recentOutfits.length > 0" class="recent-outfits defShadow">
          <div class="section-header">
            <h3>Недавно созданные аутфиты</h3>
            <button @click="navigateToOutfits" class="button view-all-btn">
              Смотреть все
            </button>
          </div>

          <div class="outfit-list">
            <div
                v-for="outfit in recentOutfits"
                :key="outfit.id"
                class="outfit-item defShadow"
                @click="navigateToOutfits"
            >
              <div class="outfit-info">
                <div class="outfit-name">{{ outfit.name }}</div>
                <div class="outfit-count">
                  {{ outfit.clothing_ids ? outfit.clothing_ids.length : 0 }} вещей
                </div>
              </div>
              <div class="outfit-icon">✨</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for New Users -->
      <div v-if="totalClothes === 0 && totalOutfits === 0 && !isLoading" class="empty-dashboard defShadow">
        <div class="empty-icon">🌟</div>
        <h3>Начните создавать свой цифровой гардероб!</h3>
        <p>Добавьте первую вещь, чтобы начать организовывать свой стиль</p>
        <button @click="navigateToClothesAdd" class="button get-started-btn">
          Добавить первую вещь
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-screen {
  width: 100%;
  margin-bottom: 10vh;
}

/* Welcome Section (Non-authenticated) */
.welcome-section {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  border-radius: 25px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-description {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: bold;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.cta-secondary {
  background: #f0f0f0;
  color: #666;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Dashboard (Authenticated) */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.welcome-back {
  text-align: center;
  padding: 2rem;
  border-radius: 20px;
}

.welcome-back h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.welcome-back p {
  color: #666;
  font-size: 1.1rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  margin-right: 1rem;
  max-width: 3vh;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.quick-actions {
  padding: 2rem;
  border-radius: 20px;
}

.quick-actions h3 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.tertiary {
  background: #f8f9fa;
  color: #495057;
}

.btn-icon {
  font-size: 1.2rem;
  max-width: 3vh;
}

.recent-section {
  display: grid;
  gap: 2rem;
}

.recent-clothes, .recent-outfits {
  padding: 2rem;
  border-radius: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  color: #333;
  margin: 0;
}

.view-all-btn {
  background: transparent;
  color: #4facfe;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.recent-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.recent-item:hover {
  transform: translateY(-3px);
}

.item-image-container {
  height: 120px;
  background: white;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-info {
  padding: 0.8rem;
}

.item-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.item-details {
  display: flex;
  gap: 0.5rem;
}

.item-size, .item-season {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.outfit-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.outfit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.outfit-item:hover {
  transform: translateX(5px);
}

.outfit-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.2rem;
}

.outfit-count {
  color: #666;
  font-size: 0.9rem;
}

.outfit-icon {
  font-size: 1.5rem;
}

.empty-dashboard {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-dashboard h3 {
  color: #333;
  margin-bottom: 1rem;
}

.empty-dashboard p {
  color: #666;
  margin-bottom: 2rem;
}

.get-started-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: bold;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.defShadow:hover {
  box-shadow: 18px 18px 30px #D1D9E6, -18px -18px 30px #FFFFFF;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-primary, .cta-secondary {
    width: 100%;
    max-width: 300px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .recent-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0 1rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .recent-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}</style>