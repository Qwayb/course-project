<script setup>
  import { ref } from 'vue';
  const isAuthenticated = ref(!!localStorage.getItem('authToken'));
</script>

<template>


  <h1>main screen</h1>

  <p v-if="isAuthenticated">вы в аккаунте</p>

</template>

<style scoped>

</style>