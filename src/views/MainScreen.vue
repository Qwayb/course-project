<script setup>
  import { ref } from 'vue';
  import Header from "@/components/Header.vue";

  const isAuthenticated = ref(!!localStorage.getItem('authToken'));
</script>

<template>

  <Header/>

  <h1>main screen</h1>

  <p v-if="isAuthenticated">вы в аккаунте</p>

  <router-link v-if="isAuthenticated" to="/logout">выйти</router-link>

</template>

<style scoped>

</style>