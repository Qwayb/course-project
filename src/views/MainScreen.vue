<script setup>
  import { useUserStore } from '../stores/user';
  const store = useUserStore();
</script>

<template>


  <h1>main screen</h1>

  <p v-if="store.isAuthenticated">вы в аккаунте</p>

</template>

<style scoped>

</style>