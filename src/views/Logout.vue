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
  <div class="form">
    <h2>Выход</h2>
    <p>Вы уверены что хотите выйти?</p>
    <div class="form_buttons">
      <button @click="logout">Да</button>
      <router-link class="button underline" to="mainScreen">Нет</router-link>
    </div>
  </div>
</template>

<style scoped>

  p{
    margin-bottom: 64px;
  }
  .form_buttons {
    display: flex;
    width: 50%;
    align-items: center;
    justify-content: space-between;
  }

  button{
    background: none;
    box-shadow: none;

  }
</style>