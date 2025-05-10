<script setup>
import { ref, computed } from 'vue';

const formData = ref({
  name: '',
  seasons: [],
  styles: [],
  size: '',
  imageFile: null
});

const previewImage = ref(null);
const isSubmitting = ref(false);

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
  }
};

const submitForm = async () => {
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
    // 1. Загружаем изображение
    const imageFormData = new FormData();
    imageFormData.append('file', formData.value.imageFile);

    const uploadResponse = await fetch('https://87bb0d4c94472c27.mokky.dev/uploads', {
      method: 'POST',
      body: imageFormData,
      // Добавляем заголовки для CORS
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

    // 2. Сохраняем данные о вещи
    const clothingData = {
      name: formData.value.name,
      seasons: formData.value.seasons,
      styles: formData.value.styles,
      size: formData.value.size,
      imageUrl: imageData.url
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

  } catch (error) {
    console.error('Ошибка:', error);
    alert(`Ошибка: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="add-clothing-form">
    <h2>Добавить новую вещь</h2>

    <!-- Поле для загрузки фото -->
    <div class="upload-area">
      <input type="file" id="file-upload" @change="handleFileSelect" accept="image/*" hidden />
      <label for="file-upload" class="upload-label">
        <span v-if="!previewImage">Перетащите или <u>Выбрать</u></span>
        <img v-else :src="previewImage" class="preview-image" />
      </label>
    </div>

    <!-- Название вещи -->
    <div class="form-group">
      <label>Название</label>
      <input v-model="formData.name" type="text" placeholder="Введите название" />
    </div>

    <!-- Сезоны -->
    <div class="form-group">
      <div class="select-header" @click="toggleDropdown('seasons')">
        <label>Сезон</label>
        <span>{{ selectedSeasonsText }}</span>
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
        <span>{{ selectedStylesText }}</span>
      </div>
      <div v-if="dropdowns.styles" class="dropdown-options">
        <div v-for="style in styles" :key="style" class="option">
          <input
              type="checkbox"
              :id="'style-' + style"
              :value="style"
              v-model="formData.styles"
          />
          <label :for="'style-' + style">{{ style }}</label>
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
    <button @click="submitForm" :disabled="isSubmitting" class="submit-btn">
      {{ isSubmitting ? 'Добавляем...' : 'Добавить' }}
    </button>
  </div>
</template>

<style scoped>
.add-clothing-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.upload-area {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  margin-top: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.select-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown-options {
  border: 1px solid #eee;
  padding: 10px;
  margin-top: 5px;
}

.option {
  padding: 5px 0;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
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