<script setup>
import { ref } from 'vue';
const isAuthenticated = ref(!!localStorage.getItem('authToken'));
</script>

<template>
  <nav class="defShadow">
    <div class="nav_elements">
      <router-link class="button" to="/">Главная</router-link>

      <router-link class="button" to="/">Одежда</router-link>
      <router-link class="button" to="/">Аутфиты</router-link>
      <router-link class="button" to="/">Желания</router-link>
    </div>

    <!---->

    <div v-if="!isAuthenticated" class="nav_elements">
      <router-link class="button" to="/register">Регистрация</router-link>
      <router-link class="button" to="/login">Вход</router-link>
    </div>

    <div v-if="isAuthenticated" class="nav_elements">
      <router-link class="button" to="/profile">Профиль</router-link>
    </div>
  </nav>
</template>

<style scoped>
nav {
  width: 100%;
  height: 94px;
  align-items: center;
  padding: 0 60px;
  gap: 10px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 79px;
}

.nav_elements {
  display: flex;
  gap: 10px;
}
</style>