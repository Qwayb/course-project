<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const store = useUserStore();

// Redirect to login if not authenticated
onMounted(() => {
  if (!store.isAuthenticated) {
    router.push('/login');
  }
});

const formData = ref({
  name: '',
  seasons: [],
  styles: [],
  size: '',
  imageFile: null
});

const previewImage = ref(null);
const processedImage = ref(null); // New: for background-removed image
const isSubmitting = ref(false);
const isRemovingBackground = ref(false); // New: loading state for background removal

// Your API key for background removal
const BG_REMOVAL_API_KEY = 'sWvchEZJ4GtbCED8PVaX6Whp';

// Опции для выбора
const seasons = ['Весна', 'Лето', 'Осень', 'Зима'];
const styles = ['Повседневный', 'Рабочий', 'Классический'];
const sizes = ['XS', 'S', 'M', 'L', 'XL'];

// Управление dropdown
const dropdowns = ref({
  seasons: false,
  styles: false,
  sizes: false
});

// Вычисляемые свойства
const selectedSeasonsText = computed(() =>
    formData.value.seasons.length > 0 ? formData.value.seasons.join(', ') : 'Выберите сезон(ы)'
);

const selectedStylesText = computed(() =>
    formData.value.styles.length > 0 ? formData.value.styles.join(', ') : 'Выберите стиль(и)'
);

const toggleDropdown = (name) => {
  dropdowns.value = {
    seasons: false,
    styles: false,
    sizes: false,
    [name]: !dropdowns.value[name]
  };
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.type.match('image.*')) {
    // Проверяем размер файла (не более 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Изображение должно быть меньше 5MB');
      return;
    }
    formData.value.imageFile = file;
    previewImage.value = URL.createObjectURL(file);
    // Reset processed image when new file is selected
    processedImage.value = null;
  }
};

// NEW FUNCTION: Remove background from image
const removeBackground = async () => {
  if (!formData.value.imageFile) {
    alert('Сначала выберите изображение');
    return;
  }

  isRemovingBackground.value = true;

  try {
    // Create FormData for the API request
    const bgRemovalFormData = new FormData();
    bgRemovalFormData.append('image_file', formData.value.imageFile);
    bgRemovalFormData.append('size', 'auto'); // You can change this to 'preview', 'small', 'regular', etc.

    // Make API request to remove.bg
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': BG_REMOVAL_API_KEY,
      },
      body: bgRemovalFormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0]?.title || `HTTP error! status: ${response.status}`);
    }

    // Get the processed image as blob
    const imageBlob = await response.blob();

    // Create URL for preview
    processedImage.value = URL.createObjectURL(imageBlob);

    // Convert blob to File object for later upload
    const processedFile = new File([imageBlob], `processed_${formData.value.imageFile.name}`, {
      type: 'image/png' // remove.bg returns PNG images
    });

    // Update the form data with processed image
    formData.value.imageFile = processedFile;

    console.log('Background removed successfully!');

  } catch (error) {
    console.error('Error removing background:', error);
    alert(`Ошибка удаления фона: ${error.message}`);
  } finally {
    isRemovingBackground.value = false;
  }
};

// Function to use original image
const useOriginalImage = () => {
  // Re-read the original file
  const fileInput = document.getElementById('file-upload');
  if (fileInput.files[0]) {
    formData.value.imageFile = fileInput.files[0];
    processedImage.value = null;
  }
};

const submitForm = async () => {
  // Check if user is still authenticated
  if (!store.isAuthenticated || !store.currentUser) {
    alert('Вы должны быть авторизованы для добавления одежды');
    router.push('/login');
    return;
  }

  if (!formData.value.name) {
    alert('Пожалуйста, укажите название вещи');
    return;
  }

  if (!formData.value.imageFile) {
    alert('Пожалуйста, загрузите изображение');
    return;
  }

  isSubmitting.value = true;

  try {
    // 1. Загружаем изображение (now it could be the processed one)
    const imageFormData = new FormData();
    imageFormData.append('file', formData.value.imageFile);

    const uploadResponse = await fetch('https://87bb0d4c94472c27.mokky.dev/uploads', {
      method: 'POST',
      body: imageFormData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${uploadResponse.status}`);
    }

    const imageData = await uploadResponse.json();
    console.log('Изображение загружено:', imageData);

    if (!imageData.url) {
      throw new Error('Сервер не вернул URL изображения');
    }

    // 2. Сохраняем данные о вещи с привязкой к пользователю
    const clothingData = {
      name: formData.value.name,
      seasons: formData.value.seasons,
      styles: formData.value.styles,
      size: formData.value.size,
      imageUrl: imageData.url,
      users_id: store.currentUser.id // Добавляем ID текущего пользователя
    };

    const clothingResponse = await fetch('https://87bb0d4c94472c27.mokky.dev/clothes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(clothingData)
    });

    if (!clothingResponse.ok) {
      const errorData = await clothingResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${clothingResponse.status}`);
    }

    const result = await clothingResponse.json();
    console.log('Вещь успешно добавлена:', result);
    alert('Вещь успешно добавлена в ваш гардероб!');

    // Сбрасываем форму
    formData.value = {
      name: '',
      seasons: [],
      styles: [],
      size: '',
      imageFile: null
    };
    previewImage.value = null;
    processedImage.value = null;

    // Перенаправляем на страницу с одеждой
    router.push('/clothes');

  } catch (error) {
    console.error('Ошибка:', error);
    alert(`Ошибка: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="!store.isAuthenticated" class="not-authenticated">
    <h2>Доступ запрещен</h2>
    <p>Вы должны быть авторизованы для добавления одежды</p>
    <router-link to="/login" class="button">Войти</router-link>
  </div>

  <div v-else class="add-clothing-form">

    <!--фото-->
    <div class="upload-area defShadow">
      <input type="file" id="file-upload" @change="handleFileSelect" accept="image/*" hidden=""/>

      <label for="file-upload" class="upload-label">

        <div v-if="!previewImage" class="upload-label-noPreview">
          <img class="upload-label-noPreview__img" src="../assets/images/upload.svg">
          <span class="upload-label-noPreview__span">Перетащите или</span>
          <span class="button">Выбрать</span>
        </div>

        <!-- Show processed image if available, otherwise show original -->
        <img v-else :src="processedImage || previewImage" class="preview-image"/>
      </label>

      <!-- Background removal controls -->
      <div v-if="previewImage" class="bg-removal-controls">
        <button
            @click="removeBackground"
            :disabled="isRemovingBackground"
            class="button bg-removal-btn"
        >
          {{ isRemovingBackground ? 'Удаляем фон...' : 'Удалить фон' }}
        </button>

        <button
            v-if="processedImage"
            @click="useOriginalImage"
            class="button original-btn"
        >
          Использовать оригинал
        </button>
      </div>

      <!-- Status indicator -->
      <div v-if="processedImage" class="processed-indicator">
        ✨ Фон удален
      </div>
    </div>

    <!--инпуты-->
    <div class="input-area">

      <!-- Название вещи -->
      <div class="form-group">
        <input class="input-area__name-input" v-model="formData.name" type="text" placeholder="Название"/>
      </div>

      <!-- Сезоны -->
      <div class="form-group">

        <div class="select-header" @click="toggleDropdown('seasons')">
          <label>Сезон</label>
          <div class="select-options">
            <span>{{ selectedSeasonsText }}</span>
            <img src="../assets/images/arrow.svg" alt="arrow">
          </div>
        </div>

        <div v-if="dropdowns.seasons" class="dropdown-options">

          <div v-for="season in seasons" :key="season" class="option">
            <input
                type="checkbox"
                :id="'season-' + season"
                :value="season"
                v-model="formData.seasons"
            />
            <label :for="'season-' + season">{{ season }}</label>
          </div>

        </div>

      </div>

      <!-- Стиль -->
      <div class="form-group">

        <div class="select-header" @click="toggleDropdown('styles')">
          <label>Стиль</label>
          <span>{{ selectedStylesText }} <img src="../assets/images/arrow.svg" alt="arrow"></span>
        </div>

        <div v-if="dropdowns.styles" class="dropdown-options">
          <div v-for="style in styles" :key="style" class="option">
            <input
                type="checkbox"
                :id="'style-' + style"
                :value="style"
                v-model="formData.styles"
            />
            <label :for="'style-' + style" class="options">{{ style }}</label>
          </div>
        </div>

      </div>

      <!-- Размер -->
      <div class="form-group">
        <div class="select-header" @click="toggleDropdown('sizes')">
          <label>Размер</label>
          <span>{{ formData.size || 'Выберите размер' }}</span>
        </div>
        <div v-if="dropdowns.sizes" class="dropdown-options">
          <div v-for="size in sizes" :key="size" class="option">
            <input
                type="radio"
                :id="'size-' + size"
                :value="size"
                v-model="formData.size"
                name="size"
            />
            <label :for="'size-' + size">{{ size }}</label>
          </div>
        </div>
      </div>

      <!-- Кнопка добавления -->
      <button @click="submitForm" :disabled="isSubmitting" class="button button-submit">
        {{ isSubmitting ? 'Добавляем...' : 'Добавить' }}
      </button>
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

.options {
  background-color: #ECF0F3;
  border-radius: 15px;
  box-shadow: 18px 18px 30px #D1D9E6,
  -18px -18px 30px #FFFFFF;
  max-width: fit-content;
  padding: 7px 10px;
  cursor: pointer;
}

.options:hover {
  border: solid 1px;
}

.select-header > span {
  color: #328BFF;
}

.select-options {
  display: flex;
}

.input-area__name-input {
  background: none;
  box-shadow: none;
  margin: 0;
}

.add-clothing-form {
  display: flex;
  justify-content: space-between;
}

.input-area {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 2vh;
}

.upload-label-noPreview__img {
  width: 144px;
}

.upload-label-noPreview__span {
  font-weight: bold;
  font-size: 16px;
  opacity: 0.5;
}

.upload-label-noPreview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 47px;
}

.add-clothing-form {
  gap: 10vh;
}

.upload-area {
  border: 2px dashed #000;
  cursor: pointer;
  max-height: 656px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.defShadow:hover {
  box-shadow: 18px 18px 30px #D1D9E6,
  -18px -18px 30px #FFFFFF;
}

.upload-label {
  cursor: pointer;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 13px;
  object-fit: contain;
}

/* NEW STYLES for background removal */
.bg-removal-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.bg-removal-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.bg-removal-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.bg-removal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.original-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.original-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
}

.processed-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.form-group {
  margin-bottom: 2vh;
}

.select-header {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 2vh;
}

.dropdown-options {
  display: flex;
  justify-content: space-between;
}

.option {
  padding: 5px 0;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.button-submit {
  font-weight: bold;
  font-size: 2vh;
  padding: 2vh 4vh;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-btn:hover {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>