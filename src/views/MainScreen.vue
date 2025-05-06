<script setup>
  import { ref } from 'vue';

  const isAuthenticated = ref(!!localStorage.getItem('authToken'));
</script>

<template>
  <h1>main screen</h1>

  <p v-if="isAuthenticated">вы в аккаунте</p>

  <router-link to="/login">Логин</router-link>
  <br>
  <router-link to="/register">Рег</router-link>
  <br>
  <router-link to="/">main</router-link>
  <br>
  <router-link v-if="isAuthenticated" to="/logout">выйти</router-link>

</template>

<style scoped>

</style>