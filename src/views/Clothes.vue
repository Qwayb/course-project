<script setup>
import { ref, onMounted, computed } from 'vue';

const clothes = ref([]);
const isLoading = ref(false);
const error = ref('');

// NEW: Sorting state
const sortBy = ref('name'); // Default sort by name
const sortOrder = ref('asc'); // 'asc' or 'desc'
const filterBy = ref({
  size: '',
  season: '',
  style: ''
});

// NEW: Available options for filtering
const availableSizes = ['XS', 'S', 'M', 'L', 'XL'];
const availableSeasons = ['Весна', 'Лето', 'Осень', 'Зима'];
const availableStyles = ['Повседневный', 'Рабочий', 'Классический'];

// NEW: Computed property for sorted and filtered clothes
const sortedAndFilteredClothes = computed(() => {
  let result = [...clothes.value];

  // Apply filters
  if (filterBy.value.size) {
    result = result.filter(item => item.size === filterBy.value.size);
  }
  if (filterBy.value.season) {
    result = result.filter(item =>
        item.seasons && item.seasons.includes(filterBy.value.season)
    );
  }
  if (filterBy.value.style) {
    result = result.filter(item =>
        item.styles && item.styles.includes(filterBy.value.style)
    );
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'size':
        // Sort by size order: XS, S, M, L, XL
        const sizeOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5 };
        aValue = sizeOrder[a.size] || 999;
        bValue = sizeOrder[b.size] || 999;
        break;
      case 'seasons':
        // Sort by first season alphabetically
        aValue = (a.seasons && a.seasons.length > 0) ? a.seasons[0] : 'zzz';
        bValue = (b.seasons && b.seasons.length > 0) ? b.seasons[0] : 'zzz';
        break;
      case 'styles':
        // Sort by first style alphabetically
        aValue = (a.styles && a.styles.length > 0) ? a.styles[0] : 'zzz';
        bValue = (b.styles && b.styles.length > 0) ? b.styles[0] : 'zzz';
        break;
      case 'dateAdded':
        // Sort by ID (assuming higher ID = more recent)
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

// NEW: Functions for sorting and filtering
const setSortBy = (field) => {
  if (sortBy.value === field) {
    // Toggle sort order if same field
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

const clearFilters = () => {
  filterBy.value = {
    size: '',
    season: '',
    style: ''
  };
};

const getSortIcon = (field) => {
  if (sortBy.value !== field) return '↿️⇂';
  return sortOrder.value === 'asc' ? '↑' : '↓';
};

// Функция для загрузки одежды
const fetchClothes = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await fetch('https://87bb0d4c94472c27.mokky.dev/clothes', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    clothes.value = data;
    console.log('Загружено вещей:', data.length);

  } catch (err) {
    console.error('Ошибка при загрузке одежды:', err);
    error.value = 'Не удалось загрузить одежду';
  } finally {
    isLoading.value = false;
  }
};

// Функция для извлечения ID изображения из URL
const extractImageIdFromUrl = (imageUrl) => {
  try {
    return fetch('https://87bb0d4c94472c27.mokky.dev/uploads', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(uploads => {
          const image = uploads.find(upload => upload.url === imageUrl);
          return image ? image.id : null;
        });
  } catch (err) {
    console.error('Ошибка при поиске ID изображения:', err);
    return null;
  }
};

// Функция для удаления изображения
const deleteImage = async (imageId) => {
  if (!imageId) return;

  try {
    const response = await fetch(`https://87bb0d4c94472c27.mokky.dev/uploads/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Изображение удалено:', imageId);
  } catch (err) {
    console.error('Ошибка при удалении изображения:', err);
  }
};

// Функция для удаления вещи
const deleteClothingItem = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить эту вещь?')) {
    return;
  }

  try {
    const clothingItem = clothes.value.find(item => item.id === id);
    if (!clothingItem) {
      throw new Error('Элемент одежды не найден');
    }

    const imageId = await extractImageIdFromUrl(clothingItem.imageUrl);

    const response = await fetch(`https://87bb0d4c94472c27.mokky.dev/clothes/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    clothes.value = clothes.value.filter(item => item.id !== id);
    console.log('Вещь удалена:', id);

    if (imageId) {
      await deleteImage(imageId);
    }

  } catch (err) {
    console.error('Ошибка при удалении:', err);
    alert('Не удалось удалить вещь');
  }
};

// Загружаем данные при монтировании компонента
onMounted(() => {
  fetchClothes();
});
</script>

<template>
  <div class="clothes-container">

    <!-- NEW: Sorting and Filtering Controls -->
    <div class="controls-section">

      <!-- Sorting Controls -->
      <div class="sort-controls">
        <h3>Сортировка</h3>
        <div class="sort-buttons">
          <button
              @click="setSortBy('name')"
              :class="{ active: sortBy === 'name' }"
              class="sort-btn "
          >
            По названию {{ getSortIcon('name') }}
          </button>
          <button
              @click="setSortBy('size')"
              :class="{ active: sortBy === 'size' }"
              class="sort-btn"
          >
            По размеру {{ getSortIcon('size') }}
          </button>
          <button
              @click="setSortBy('seasons')"
              :class="{ active: sortBy === 'seasons' }"
              class="sort-btn"
          >
            По сезону {{ getSortIcon('seasons') }}
          </button>
          <button
              @click="setSortBy('styles')"
              :class="{ active: sortBy === 'styles' }"
              class="sort-btn"
          >
            По стилю {{ getSortIcon('styles') }}
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

      <!-- Filter Controls -->
      <div class="filter-controls">
        <h3>Фильтры</h3>
        <div class="filter-row">

          <!-- Size Filter -->
          <div class="filter-group">
            <label>Размер:</label>
            <select v-model="filterBy.size" class="filter-select">
              <option value="">Все размеры</option>
              <option v-for="size in availableSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <!-- Season Filter -->
          <div class="filter-group">
            <label>Сезон:</label>
            <select v-model="filterBy.season" class="filter-select">
              <option value="">Все сезоны</option>
              <option v-for="season in availableSeasons" :key="season" :value="season">
                {{ season }}
              </option>
            </select>
          </div>

          <!-- Style Filter -->
          <div class="filter-group">
            <label>Стиль:</label>
            <select v-model="filterBy.style" class="filter-select">
              <option value="">Все стили</option>
              <option v-for="style in availableStyles" :key="style" :value="style">
                {{ style }}
              </option>
            </select>
          </div>

          <!-- Clear Filters Button -->
          <button @click="clearFilters" class="button clear-filters-btn">
            Очистить фильтры
          </button>
        </div>
      </div>

      <!-- Results Count -->
<!--      <div class="results-info">-->
<!--        <span class="results-count">-->
<!--          Показано: {{ sortedAndFilteredClothes.length }} из {{ clothes.length }} вещей-->
<!--        </span>-->
<!--      </div>-->
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="loading">
      <p>Загрузка...</p>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchClothes" class="button">Попробовать снова</button>
    </div>

    <!-- Сетка с одеждой -->
    <div v-if="!isLoading && !error" class="clothes-grid">
      <router-link to="/clothesAdd" class="add-button-container clothing-card defShadow">
        <img src="../assets/images/plus.svg" alt="add" class="">
      </router-link>

      <!-- Карточка одежды -->
      <div
          v-for="item in sortedAndFilteredClothes"
          :key="item.id"
          class="clothing-card defShadow"
      >
        <!-- Изображение -->
        <div class="card-image-container">
          <img
              :src="item.imageUrl"
              :alt="item.name"
              class="card-image"
              @error="$event.target.src = '/placeholder-image.jpg'"
          />
        </div>

        <!-- Информация о вещи -->
        <div class="card-content">
          <h3 class="card-title">{{ item.name }}</h3>

          <!-- Сезоны -->
          <div v-if="item.seasons && item.seasons.length > 0" class="card-info">
            <span class="info-label">Сезон:</span>
            <div class="tags">
              <span
                  v-for="season in item.seasons"
                  :key="season"
                  class="tag season-tag"
              >
                {{ season }}
              </span>
            </div>
          </div>

          <!-- Стили -->
          <div v-if="item.styles && item.styles.length > 0" class="card-info">
            <span class="info-label">Стиль:</span>
            <div class="tags">
              <span
                  v-for="style in item.styles"
                  :key="style"
                  class="tag style-tag"
              >
                {{ style }}
              </span>
            </div>
          </div>

          <!-- Размер -->
          <div v-if="item.size" class="card-info">
            <span class="info-label">Размер:</span>
            <span class="tag size-tag">{{ item.size }}</span>
          </div>

          <!-- Кнопка удаления -->
          <button
              @click="deleteClothingItem(item.id)"
              class="delete-button"
              title="Удалить вещь"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !error && sortedAndFilteredClothes.length === 0 && clothes.length > 0" class="empty-filtered">
      <p>Нет вещей, соответствующих выбранным фильтрам</p>
      <button @click="clearFilters" class="button">Сбросить фильтры</button>
    </div>
  </div>
</template>

<style scoped>
.clothes-container {
  width: 100%;
  margin-bottom: 10vh;
}

/* NEW: Controls Section Styles */
.controls-section {
  background: #ECF0F3;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow:
      18px 18px 30px #D1D9E6,
      -18px -18px 30px #FFFFFF;
}

.sort-controls, .filter-controls {
  margin-bottom: 4vh;
}

.sort-controls h3, .filter-controls h3 {
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

.filter-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.filter-select {
  background: #ECF0F3;
  border: none;
  border-radius: 12px;
  padding: 10px 15px;
  min-width: 140px;
  box-shadow: inset 4px 4px 8px #D1D9E6;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  box-shadow: inset 6px 6px 12px #D1D9E6;
}

.clear-filters-btn {
  border-radius: 12px;
  padding: 10px 20px;
}

.results-info {
  border-top: 1px solid #D1D9E6;
  padding-top: 15px;
  text-align: center;
}

.results-count {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.empty-filtered {
  text-align: center;
  padding: 40px;
  background: #ECF0F3;
  border-radius: 20px;
  box-shadow:
      18px 18px 30px #D1D9E6,
      -18px -18px 30px #FFFFFF;
}

.empty-filtered p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

/* Existing styles */
.add-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.Card__add {
  padding: 145px 119px;
  transition: all 0.3s ease;
}

.Card__add:hover {
  transform: scale(1.05);
}

.loading, .error-message, .empty-state {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error-message {
  color: #c30000;
}

.clothes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.clothing-card {
  padding: 1.5rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.clothing-card:hover {
  transform: translateY(-5px);
}

.card-image-container {
  width: 100%;
  height: 250px;
  margin-bottom: 1rem;
  border-radius: 10px;
  overflow: hidden;
  //background-color: #f5f5f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.tag {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.season-tag {
  background-color: #e3f2fd;
  color: #1976d2;
}

.style-tag {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.size-tag {
  background-color: #e8f5e8;
  color: #388e3c;
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

/* Адаптивность */
@media (max-width: 768px) {
  .controls-section {
    padding: 20px;
  }

  .sort-buttons {
    justify-content: center;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    min-width: auto;
  }

  .clothes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .Card__add {
    padding: 80px 60px;
  }

  .clothing-card {
    padding: 1rem;
  }

  .card-image-container {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .clothes-grid {
    grid-template-columns: 1fr;
  }

  .Card__add {
    padding: 60px 40px;
  }

  .sort-buttons {
    flex-direction: column;
  }

  .sort-btn {
    width: 100%;
  }
}
</style>