<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const status = ref(null);
const jsonData = ref(null);
const isLoading = ref(false);

function updateStatus(ok) {
  if (ok) {
    status.value.innerText = "Авторизован!";
    status.value.className = "success";
  } else {
    status.value.innerText = "Не авторизован!";
    status.value.className = "error";
  }
}

async function onSubmit(event) {
  event.preventDefault();
  isLoading.value = true;

  try {
    const res = await fetch("https://87bb0d4c94472c27.mokky.dev/auth", { // Исправлен эндпоинт
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    updateStatus(res.ok);

    if (res.ok) {
      const json = await res.json();
      console.log("Успешная авторизация:", json);
      jsonData.value = json;

      // Сохраняем токен (если сервер его возвращает)
      if (json.token) {
        localStorage.setItem('token', json.token);
      }
    } else {
      const error = await res.json();
      console.error("Ошибка авторизации:", error);
    }
  } catch (error) {
    console.error("Сетевая ошибка:", error);
    updateStatus(false);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit="onSubmit">
    <input
        type="email"
        placeholder="Email"
        v-model="email"
        required
    />
    <input
        type="password"
        placeholder="Пароль"
        v-model="password"
        required
    />
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Загрузка...' : 'Войти' }}
    </button>
  </form>

  <hr />

  <h2 ref="status" class="error">Не авторизован</h2>

  <pre v-if="jsonData">{{ JSON.stringify(jsonData, null, 2) }}</pre>

  <router-link to="/">На главную</router-link>
</template>

<style scoped>

</style>