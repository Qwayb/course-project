<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const store = useUserStore();

// Redirect to login if not authenticated
onMounted(() => {
  if (!store.isAuthenticated) {
    router.push('/login');
    return;
  }
  // Fetch outfits and clothes only if authenticated
  fetchOutfits();
  fetchClothes();
});

const outfits = ref([]);
const clothes = ref([]);
const isLoading = ref(false);
const error = ref('');

// Sorting state
const sortBy = ref('name');
const sortOrder = ref('asc');

// Computed property for sorted outfits
const sortedOutfits = computed(() => {
  let result = [...outfits.value];

  result.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'itemCount':
        aValue = a.clothing_ids ? a.clothing_ids.length : 0;
        bValue = b.clothing_ids ? b.clothing_ids.length : 0;
        break;
      case 'dateAdded':
        aValue = a.id;
        bValue = b.id;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrder.value === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder.value === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return result;
});

// Functions for sorting
const setSortBy = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

const getSortIcon = (field) => {
  if (sortBy.value !== field) return '↿️⇂';
  return sortOrder.value === 'asc' ? '↑' : '↓';
};

// Function to fetch outfits for current user
const fetchOutfits = async () => {
  if (!store.isAuthenticated || !store.currentUser) {
    console.error('Пользователь не аутентифицирован');
    router.push('/login');
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    const response = await fetch(`https://87bb0d4c94472c27.mokky.dev/outfits?users_id=${store.currentUser.id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const userOutfits = data.filter(item => item.users_id === store.currentUser.id);
    outfits.value = userOutfits;

    console.log('Загружено аутфитов для пользователя:', userOutfits.length);

  } catch (err) {
    console.error('Ошибка при загрузке аутфитов:', err);
    error.value = 'Не удалось загрузить аутфиты';
  } finally {
    isLoading.value = false;
  }
};

// Function to fetch clothes to get clothing details
const fetchClothes = async () => {
  if (!store.isAuthenticated || !store.currentUser) {
    return;
  }

  try {
    const response = await fetch(`https://87bb0d4c94472c27.mokky.dev/clothes?users_id=${store.currentUser.id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const userClothes = data.filter(item => item.users_id === store.currentUser.id);
    clothes.value = userClothes;

  } catch (err) {
    console.error('Ошибка при загрузке одежды:', err);
  }
};

// Function to get clothing items for an outfit
const getClothingItemsForOutfit = (clothingIds) => {
  if (!clothingIds || !Array.isArray(clothingIds)) return [];
  return clothes.value.filter(item => clothingIds.includes(item.id));
};

// Function to delete outfit
const deleteOutfit = async (id) => {
  if (!store.isAuthenticated || !store.currentUser) {
    alert('Вы должны быть авторизованы для удаления аутфитов');
    return;
  }

  const outfit = outfits.value.find(item => item.id === id);
  if (!outfit) {
    alert('Аутфит не найден');
    return;
  }

  if (outfit.users_id !== store.currentUser.id) {
    alert('Вы можете удалять только свои аутфиты');
    return;
  }

  if (!confirm('Вы уверены, что хотите удалить этот аутфит?')) {
    return;
  }

  try {
    const response = await fetch(`https://87bb0d4c94472c27.mokky.dev/outfits/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    outfits.value = outfits.value.filter(item => item.id !== id);
    console.log('Аутфит удален:', id);

  } catch (err) {
    console.error('Ошибка при удалении:', err);
    alert('Не удалось удалить аутфит');
  }
};
</script>

<template>
  <div v-if="!store.isAuthenticated" class="not-authenticated">
    <h2>Доступ запрещен</h2>
    <p>Вы должны быть авторизованы для просмотра аутфитов</p>
    <router-link to="/login" class="button">Войти</router-link>
  </div>

  <div v-else class="outfits-container">

    <!-- Sorting Controls -->
    <div class="controls-section">
      <div class="sort-controls">
        <h3>Сортировка</h3>
        <div class="sort-buttons">
          <button
              @click="setSortBy('name')"
              :class="{ active: sortBy === 'name' }"
              class="sort-btn"
          >
            По названию {{ getSortIcon('name') }}
          </button>
          <button
              @click="setSortBy('itemCount')"
              :class="{ active: sortBy === 'itemCount' }"
              class="sort-btn"
          >
            По количеству вещей {{ getSortIcon('itemCount') }}
          </button>
          <button
              @click="setSortBy('dateAdded')"
              :class="{ active: sortBy === 'dateAdded' }"
              class="sort-btn"
          >
            По дате {{ getSortIcon('dateAdded') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading">
      <p>Загрузка...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchOutfits" class="button">Попробовать снова</button>
    </div>

    <!-- Empty State - no outfits at all -->
    <div v-if="!isLoading && !error && outfits.length === 0" class="empty-state">
      <h3>У вас пока нет аутфитов</h3>
      <p>Создайте первый аутфит, комбинируя вашу одежду</p>
      <router-link to="/outfitsAdd" class="button">Создать аутфит</router-link>
    </div>

    <!-- Outfits grid -->
    <div v-if="!isLoading && !error && outfits.length > 0" class="outfits-grid">
      <router-link to="/outfitsAdd" class="add-button-container outfit-card defShadow">
        <img src="../assets/images/plus.svg" alt="add" class="">
      </router-link>

      <!-- Outfit card -->
      <div
          v-for="outfit in sortedOutfits"
          :key="outfit.id"
          class="outfit-card defShadow"
      >
        <!-- Clothing images -->
        <div class="card-images-container">
          <div
              v-for="(clothingItem, index) in getClothingItemsForOutfit(outfit.clothing_ids).slice(0, 4)"
              :key="clothingItem.id"
              class="clothing-thumbnail"
              :style="{ zIndex: 4 - index }"
          >
            <img
                :src="clothingItem.imageUrl"
                :alt="clothingItem.name"
                class="thumbnail-image"
                @error="$event.target.src = '/placeholder-image.jpg'"
            />
          </div>
          <div
              v-if="getClothingItemsForOutfit(outfit.clothing_ids).length > 4"
              class="more-items-indicator"
          >
            +{{ getClothingItemsForOutfit(outfit.clothing_ids).length - 4 }}
          </div>
        </div>

        <!-- Outfit information -->
        <div class="card-content">
          <h3 class="card-title">{{ outfit.name }}</h3>

          <!-- Items count -->
          <div class="card-info">
            <span class="info-label">Количество вещей:</span>
            <span class="tag count-tag">{{ getClothingItemsForOutfit(outfit.clothing_ids).length }}</span>
          </div>

          <!-- Clothing items list -->
          <div v-if="getClothingItemsForOutfit(outfit.clothing_ids).length > 0" class="card-info">
            <span class="info-label">Вещи:</span>
            <div class="items-list">
              <span
                  v-for="item in getClothingItemsForOutfit(outfit.clothing_ids)"
                  :key="item.id"
                  class="item-name"
              >
                {{ item.name }}
              </span>
            </div>
          </div>

          <!-- Delete button -->
          <button
              @click="deleteOutfit(outfit.id)"
              class="delete-button"
              title="Удалить аутфит"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-authenticated {
  text-align: center;
  padding: 2rem;
}

.not-authenticated h2 {
  color: #c30000;
  margin-bottom: 1rem;
}

.not-authenticated p {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.outfits-container {
  width: 100%;
  margin-bottom: 10vh;
}

/* Controls Section Styles */
.controls-section {
  background: #ECF0F3;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow:
      18px 18px 30px #D1D9E6,
      -18px -18px 30px #FFFFFF;
}

.sort-controls {
  margin-bottom: 0;
}

.sort-controls h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}

.sort-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sort-btn {
  background: #ECF0F3;
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 10px 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow:
      8px 8px 15px #D1D9E6,
      -8px -8px 15px #FFFFFF;
}

.sort-btn:hover {
  transform: translateY(-2px);
  box-shadow:
      12px 12px 20px #D1D9E6,
      -12px -12px 20px #FFFFFF;
}

.sort-btn.active {
  border-color: #303030;
  box-shadow: inset 4px 4px 8px rgba(0,0,0,0.1);
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: #ECF0F3;
  border-radius: 20px;
  box-shadow:
      18px 18px 30px #D1D9E6,
      -18px -18px 30px #FFFFFF;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.add-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading, .error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error-message {
  color: #c30000;
}

.outfits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.outfit-card {
  padding: 1.5rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.outfit-card:hover {
  transform: translateY(-5px);
}

.card-images-container {
  width: 100%;
  height: 250px;
  margin-bottom: 1rem;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 10px;
}

.clothing-thumbnail {
  position: relative;
  flex: 1;
  min-width: calc(50% - 2.5px);
  max-width: calc(50% - 2.5px);
  height: calc(50% - 2.5px);
  border-radius: 8px;
  overflow: hidden;
}

.clothing-thumbnail:first-child {
  min-width: 100%;
  max-width: 100%;
  height: calc(50% - 2.5px);
}

.clothing-thumbnail:nth-child(2) {
  min-width: calc(50% - 2.5px);
  max-width: calc(50% - 2.5px);
  height: calc(50% - 2.5px);
}

.clothing-thumbnail:nth-child(3) {
  min-width: calc(50% - 2.5px);
  max-width: calc(50% - 2.5px);
  height: calc(50% - 2.5px);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.more-items-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.card-content {
  position: relative;
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.card-info {
  margin-bottom: 0.8rem;
}

.info-label {
  font-weight: 600;
  color: #666;
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.tag {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.count-tag {
  background-color: #e3f2fd;
  color: #1976d2;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.item-name {
  background-color: #f0f0f0;
  color: #333;
  padding: 0.2rem 0.6rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
}

.delete-button {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background-color: #cc0000;
  transform: scale(1.1);
}

.defShadow:hover {
  box-shadow:
      18px 18px 30px #D1D9E6,
      -18px -18px 30px #FFFFFF;
}

/* Responsive design */
@media (max-width: 768px) {
  .controls-section {
    padding: 20px;
  }

  .sort-buttons {
    justify-content: center;
  }

  .outfits-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .outfit-card {
    padding: 1rem;
  }

  .card-images-container {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .outfits-grid {
    grid-template-columns: 1fr;
  }

  .sort-buttons {
    flex-direction: column;
  }

  .sort-btn {
    width: 100%;
  }
}
</style>