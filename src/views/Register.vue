<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Header from "@/components/Header.vue";

const router = useRouter();
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
  <Header/>

  <h1>main screen</h1>
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
  <br>
  <router-link to="/">main</router-link>
</template>

<style scoped>

</style>