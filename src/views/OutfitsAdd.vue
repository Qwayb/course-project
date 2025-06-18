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
  // Fetch clothes only if authenticated
  fetchClothes();
});

const clothes = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref('');

const formData = ref({
  name: '',
  selectedClothingIds: []
});

// Computed property for selected clothing items
const selectedClothingItems = computed(() => {
  return clothes.value.filter(item => formData.value.selectedClothingIds.includes(item.id));
});

// Function to fetch user's clothes
const fetchClothes = async () => {
  if (!store.isAuthenticated || !store.currentUser) {
    console.error('Пользователь не аутентифицирован');
    router.push('/login');
    return;
  }

  isLoading.value = true;
  error.value = '';

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

    console.log('Загружено вещей для выбора:', userClothes.length);

  } catch (err) {
    console.error('Ошибка при загрузке одежды:', err);
    error.value = 'Не удалось загрузить одежду';
  } finally {
    isLoading.value = false;
  }
};

// Function to toggle clothing item selection
const toggleClothingSelection = (clothingId) => {
  const index = formData.value.selectedClothingIds.indexOf(clothingId);
  if (index > -1) {
    formData.value.selectedClothingIds.splice(index, 1);
  } else {
    formData.value.selectedClothingIds.push(clothingId);
  }
};

// Function to check if clothing item is selected
const isClothingSelected = (clothingId) => {
  return formData.value.selectedClothingIds.includes(clothingId);
};

// Function to submit the form
const submitForm = async () => {
  // Check if user is still authenticated
  if (!store.isAuthenticated || !store.currentUser) {
    alert('Вы должны быть авторизованы для создания аутфитов');
    router.push('/login');
    return;
  }

  if (!formData.value.name.trim()) {
    alert('Пожалуйста, укажите название аутфита');
    return;
  }

  if (formData.value.selectedClothingIds.length === 0) {
    alert('Пожалуйста, выберите хотя бы одну вещь для аутфита');
    return;
  }

  isSubmitting.value = true;

  try {
    const outfitData = {
      name: formData.value.name.trim(),
      clothing_ids: formData.value.selectedClothingIds,
      users_id: store.currentUser.id,
      created_at: new Date().toISOString()
    };

    const response = await fetch('https://87bb0d4c94472c27.mokky.dev/outfits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(outfitData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Аутфит успешно создан:', result);

    // Reset form
    formData.value = {
      name: '',
      selectedClothingIds: []
    };

    // Redirect to outfits page
    router.push('/outfits');

  } catch (error) {
    console.error('Ошибка:', error);
    alert(`Ошибка: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

// Function to deselect all clothes
const deselectAllClothes = () => {
  formData.value.selectedClothingIds = [];
};
</script>

<template>
  <h2>Создать новый аутфит</h2>

  <div v-if="!store.isAuthenticated" class="not-authenticated">
    <h2>Доступ запрещен</h2>
    <p>Вы должны быть авторизованы для создания аутфитов</p>
    <router-link to="/login" class="button">Войти</router-link>
  </div>

  <div v-else class="add-outfit-container">
    <div class="form-section">

      <!-- Outfit name input -->
      <div class="form-group">
        <input
            id="outfit-name"
            v-model="formData.name"
            type="text"
            placeholder="Название аутфита"
            class="input outfit-name-input"
            maxlength="50"
        />
      </div>

      <!-- Selected items preview -->
      <div v-if="selectedClothingItems.length > 0" class="selected-preview">
        <h3>Выбранные вещи ({{ selectedClothingItems.length }}):</h3>
        <div class="selected-items">
          <div
              v-for="item in selectedClothingItems"
              :key="item.id"
              class="selected-item"
          >
            <img :src="item.imageUrl" :alt="item.name" class="selected-item-image" />
            <span class="selected-item-name">{{ item.name }}</span>
            <button
                @click="toggleClothingSelection(item.id)"
                class="remove-item-btn"
                title="Убрать из аутфита"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <p v-if="selectedClothingItems.length > 5"> Аутфит максимум содержит 5 вещей</p>
        <button
            @click="submitForm"
            :disabled="isSubmitting || !formData.name.trim() || selectedClothingItems.length === 0 || selectedClothingItems.length > 5"
            class="button submit-button"
        >
          {{ isSubmitting ? 'Создаем...' : 'Создать аутфит' }}
        </button>
        <router-link to="/outfits" class="button cancel-button">Отменить</router-link>
      </div>
    </div>

    <div class="clothes-section">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="loading">
        <p>Загрузка одежды...</p>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchClothes" class="button">Попробовать снова</button>
      </div>

      <!-- No clothes message -->
      <div v-if="!isLoading && !error && clothes.length === 0" class="no-clothes">
        <h3>У вас нет одежды</h3>
        <p>Сначала добавьте одежду, чтобы создавать аутфиты</p>
        <router-link to="/clothesAdd" class="button">Добавить одежду</router-link>
      </div>

      <!-- Clothes selection -->
      <div v-if="!isLoading && !error && clothes.length > 0" class="clothes-selection">
        <div class="selection-header">
          <h3>Выберите вещи для аутфита:</h3>
          <div class="bulk-actions">
            <button @click="deselectAllClothes" class="button bulk-btn">Снять выделение</button>
          </div>
        </div>

        <div class="clothes-grid">
          <div
              v-for="item in clothes"
              :key="item.id"
              class="clothing-item"
              :class="{ selected: isClothingSelected(item.id) }"
              @click="toggleClothingSelection(item.id)"
          >
            <div class="item-checkbox">
              <input
                  type="checkbox"
                  :checked="isClothingSelected(item.id)"
                  @change="toggleClothingSelection(item.id)"
                  @click.stop
              />
            </div>

            <div class="item-image-container">
              <img
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="item-image"
                  @error="$event.target.src = '/placeholder-image.jpg'"
              />
            </div>

            <div class="item-details">
              <h4 class="item-name">{{ item.name }}</h4>
              <div class="item-tags">
                <span v-if="item.size" class="tag size-tag">{{ item.size }}</span>
                <span
                    v-for="season in (item.seasons || [])"
                    :key="season"
                    class="tag season-tag"
                >
                  {{ season }}
                </span>
              </div>
            </div>
          </div>
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

.add-outfit-container {
  display: flex;
  gap: 3rem;
  width: 100%;
  margin-bottom: 10vh;
}

.form-section {
  flex: 1;
  max-width: 400px;
}

.clothes-section {
  flex: 2;
  min-width: 0;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.outfit-name-input {
  width: 100%;
  font-size: 1.2rem;
  padding: 1rem;
}

.selected-preview {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #ECF0F3;
  border-radius: 15px;
  box-shadow: inset 4px 4px 8px #D1D9E6;
}

.selected-preview h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.selected-items {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-radius: 10px;
}

.selected-item-image {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 8px;
}

.selected-item-name {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.remove-item-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-item-btn:hover {
  background: #cc0000;
  transform: scale(1.1);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.submit-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: bold;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #ccc;
}

.cancel-button {
  background: #f0f0f0;
  color: #666;
  text-align: center;
  padding: 0.8rem;
}

.loading, .error-message, .no-clothes {
  text-align: center;
  padding: 2rem;
  background: #ECF0F3;
  border-radius: 15px;
  box-shadow:
      18px 18px 30px #D1D9E6,
      -18px -18px 30px #FFFFFF;
}

.error-message {
  color: #c30000;
}

.no-clothes h3 {
  color: #666;
  margin-bottom: 1rem;
}

.no-clothes p {
  margin-bottom: 4vh;
}

.clothes-selection {
  width: 100%;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #D1D9E6;
}

.selection-header h3 {
  color: #333;
  font-size: 1.3rem;
  margin: 0;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.bulk-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.clothes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.clothing-item {
  background: #ECF0F3;
  border-radius: 15px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 3px solid transparent;
  box-shadow:
      8px 8px 15px #D1D9E6,
      -8px -8px 15px #FFFFFF;
}

.clothing-item:hover {
  transform: translateY(-3px);
  box-shadow:
      12px 12px 20px #D1D9E6,
      -12px -12px 20px #FFFFFF;
}

.clothing-item.selected {
  border-color: #4facfe;
  box-shadow:
      0 0 0 2px #4facfe,
      8px 8px 15px #D1D9E6,
      -8px -8px 15px #FFFFFF;
}

.item-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.item-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.item-image-container {
  width: 100%;
  height: 150px;
  margin-bottom: 1rem;
  border-radius: 10px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-details {
  text-align: center;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: center;
}

.tag {
  padding: 0.2rem 0.6rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
}

.size-tag {
  background-color: #e8f5e8;
  color: #388e3c;
}

.season-tag {
  background-color: #e3f2fd;
  color: #1976d2;
}

/* Responsive design */
@media (max-width: 1024px) {
  .add-outfit-container {
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    max-width: none;
  }

  .selection-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .clothes-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .clothing-item {
    padding: 0.8rem;
  }

  .item-image-container {
    height: 120px;
  }

  .bulk-actions {
    flex-direction: column;
    width: 100%;
  }

  .bulk-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .clothes-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .selected-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .selected-item-name {
    font-size: 0.9rem;
  }
}
</style>