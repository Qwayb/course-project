<script setup>
import {useRouter} from 'vue-router';
import Header from "@/components/Header.vue";

const router = useRouter();

function logout (){
  localStorage.removeItem('authToken');
  router.push('/');
  console.log('asd');
}

</script>

<template>
  <Header/>

<button @click="logout">выйти</button>
</template>

<style scoped>

</style>