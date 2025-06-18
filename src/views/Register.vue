<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {useUserStore} from "@/stores/user.js";


const router = useRouter();
const store = useUserStore()
if (store.isAuthenticated) {
  router.push('/');
}
const form = ref({
  email: '',
  password: '',
  name: ''
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
        name: form.value.name
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Ошибка регистрации');
    }

    const data = await response.json();
    console.log('Успешная регистрация:', data);
    router.push('/login');

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>

  <div class="form">
    <h2>Регистрация</h2>
    <form class="input-block" @submit.prevent="handleRegister">
      <input v-model="form.name" type="text" placeholder="Имя" required class="input">
      <input v-model="form.email" type="email" placeholder="Email" required class="input">
      <input v-model="form.password" type="password" placeholder="Пароль" required class="input">
      <button class="button" type="submit" :disabled="isLoading">
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <router-link to="/login">Уже есть аккаунт? <span class="underline">Войти</span></router-link>
  </div>
</template>

<style scoped>
.input-block {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.input-block > input, button{
  width: 100%;
}

.input-block > button{
  margin: 64px 0 64px 0;
}
</style>