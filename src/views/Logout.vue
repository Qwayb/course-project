<script setup>
import {useRouter} from 'vue-router';

const router = useRouter();

function logout (){
  localStorage.removeItem('authToken');
  router.push('/');
  console.log('asd');
}

</script>

<template>
<button @click="logout">выйти</button>
</template>

<style scoped>

</style>