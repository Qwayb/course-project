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

    <!--фото-->
    <div class="upload-area defShadow">

      <input type="file" id="file-upload" @change="handleFileSelect" accept="image/*" hidden=""/>

      <label for="file-upload" class="upload-label">

        <div v-if="!previewImage" class="upload-label-noPreview">
          <img class="upload-label-noPreview__img" src="../assets/images/upload.svg">
          <span class="upload-label-noPreview__span">Пертащите или</span>
          <span class="button">Выбрать</span>
        </div>

        <img v-else :src="previewImage" class="preview-image" />
      </label>
    </div>

    <!--инпуты-->
    <div class="input-area">

      <!-- Название вещи -->
      <div class="form-group">
        <input class="input-area__name-input" v-model="formData.name" type="text" placeholder="Название" />
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
.options {
  background-color: #ECF0F3;
  border-radius: 15px;
  box-shadow:
      18px 18px 30px #D1D9E6,
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

.input-area{
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 2vh;
}

.upload-label-noPreview__img {
  width: 144px;
}

.upload-label-noPreview__span{
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
  justify-content: center;
  align-items: center;
}

.defShadow:hover {
  box-shadow:
      18px 18px 30px #D1D9E6,
      -18px -18px 30px #FFFFFF;
}

.upload-label {
  cursor: pointer;
}

.preview-image {
  width: 100%;
  border-radius: 13px;
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