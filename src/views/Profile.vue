<script setup>
import { useUserStore } from '@/stores/user'
const store = useUserStore()
</script>

<template>

  <h2>{{ store.currentUser.name }}</h2>
  <p>{{ store.currentUser.email }}</p>
  <router-link class="button" to="/logout">Выйти</router-link>

</template>

<style scoped>
.button {
  color: #c30000;
}

p {
  margin-bottom: 32px
}
</style>