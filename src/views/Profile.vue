<script setup>
import { ref } from 'vue';

const currentUser = ref(JSON.parse(localStorage.getItem('user')));

</script>

<template>

  <h2>{{ currentUser }}</h2>
  <button @click="info">инф</button>
  <router-link class="button" to="/logout">Выйти</router-link>

</template>

<style scoped>
.button {
  color: #c30000;
}
</style>