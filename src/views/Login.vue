<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();
const form = ref({
  email: '',
  password: ''
});
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await fetch('https://87bb0d4c94472c27.mokky.dev/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.value.email,
        password: form.value.password
      })
    });


    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Неверный email или пароль');
    }

    const data = await response.json();

    // удалить
    console.log(data.data.name);
    console.log('Успешный вход:', data);
    // до сюдп

    userStore.login(data.token, data.data);
    router.push('/');

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
    <h2>Вход</h2>
    <form class="input-block" @submit.prevent="handleLogin">
      <input v-model="form.email" type="email" placeholder="Email" required>
      <input v-model="form.password" type="password" placeholder="Пароль" required>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Вход...' : 'Войти' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <router-link to="/register">Нет аккаунта? <span class="underline">Зарегистрироваться</span></router-link>
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