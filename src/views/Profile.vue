<script setup>
import { useUserStore } from '@/stores/user'
const store = useUserStore()
</script>

<template>

  <h2>{{ store.currentUser.name }}</h2>
  <button @click="info">инф</button>
  <router-link class="button" to="/logout">Выйти</router-link>

</template>

<style scoped>
.button {
  color: #c30000;
}
</style>