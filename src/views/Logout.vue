<script setup>
import {useRouter} from 'vue-router';
import { useUserStore } from '@/stores/user'

const store = useUserStore();
const router = useRouter();

function logout () {
  store.logout()
  router.push('/');
}

</script>

<template>
  <div class="form">
    <h2>Выход</h2>
    <p>Вы уверены что хотите выйти?</p>
    <div class="form_buttons">
      <button @click="logout">Да</button>
      <router-link class="button underline" to="/">Нет</router-link>
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