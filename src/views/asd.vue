<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({
  email: '',
  password: '',
  name: '' // Добавляем имя, если требуется
});
const error = ref('');
const isLoading = ref(false);

async function handleRegister() {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await fetch('https://87bb0d4c94472c27.mokky.dev/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.value.email,
        password: form.value.password,
        name: form.value.name // Убедитесь, что сервер ожидает это поле
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Ошибка регистрации');
    }

    const data = await response.json();
    console.log('Успешная регистрация:', data);
    router.push('/login'); // Перенаправляем на страницу входа

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-form">
    <h2>Регистрация</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="form.name" type="text" placeholder="Имя" required>
      <input v-model="form.email" type="email" placeholder="Email" required>
      <input v-model="form.password" type="password" placeholder="Пароль" required>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <router-link to="/login">Уже есть аккаунт? Войти</router-link>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
.error {
  color: red;
}
</style>