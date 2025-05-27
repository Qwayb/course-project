<script setup>
import { ref, onMounted } from 'vue';

const clothes = ref([]);
const isLoading = ref(false);
const error = ref('');

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
    // Получаем все загруженные изображения для поиска соответствия
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
          // Ищем изображение с соответствующим URL
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
    // Не прерываем выполнение, так как основной элемент уже удален
  }
};

// Функция для удаления вещи
const deleteClothingItem = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить эту вещь?')) {
    return;
  }

  try {
    // Находим элемент одежды для получения URL изображения
    const clothingItem = clothes.value.find(item => item.id === id);
    if (!clothingItem) {
      throw new Error('Элемент одежды не найден');
    }

    // Получаем ID изображения
    const imageId = await extractImageIdFromUrl(clothingItem.imageUrl);

    // Удаляем элемент одежды
    const response = await fetch(`https://87bb0d4c94472c27.mokky.dev/clothes/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Удаляем из локального массива
    clothes.value = clothes.value.filter(item => item.id !== id);
    console.log('Вещь удалена:', id);

    // Удаляем связанное изображение
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
      <router-link to="/clothesAdd" class="add-button-container">
        <img src="../assets/images/plus.svg" alt="add" class="Card__add defShadow">
      </router-link>

      <!-- Карточка одежды -->
      <div
          v-for="item in clothes"
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
  </div>
</template>

<style scoped>
.clothes-container {
  width: 100%;
}

.add-button-container {
  display: inline-block;
  margin-bottom: 2rem;
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
  background-color: #f5f5f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}
</style>