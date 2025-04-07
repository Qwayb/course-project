<script setup>
const button = document.querySelector("button");
const jsonPre = document.querySelector("#jsonPre");
const emailInput = document.querySelector("#email");
const fullNameInput = document.querySelector("#fullName");
const passwordInput = document.querySelector("#password");
const status = document.querySelector("#status");

function updateStatus(ok) {
  if (ok){
    status.innerText = "Успешно";
    status.className = "success";
  } else {
    status.innerText = "Нет";
    status.className = "error";
  }
}

async function onSubmit(event) {
  event.preventDefault();

  button.innerText = 'Загрузка...';

  const res = await fetch("https://87bb0d4c94472c27.mokky.dev/register", {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName: fullNameInput.value,
      email: emailInput.value,
      password: passwordInput.value
    })
  });
  updateStatus(res.ok);

  if (res.ok) {
    const json = await res.json();
    console.log(json);
    jsonPre.innerHTML = json.strategy(json, null, 2);
  }

  button.innerText = "Зарегистрироваться";
}
</script>

<template>
  <h1>main screen</h1>
  <form @onSubmit="onSubmit">
    <input type="text" placeholder="Имя пользователя" id="fullName" required="required"/>
    <input type="email" placeholder="Email" id="email" required="required"/>
    <input type="password" placeholder="Пароль" id="password" required="required"/>
    <button type="submit" id="button">Зарегистрироваться</button>
  </form>

  <hr />

  <h2 id="status">Не зарегистрирован!</h2>

  <pre id="jsonPre"></pre>

  <router-link to="/">main</router-link>
</template>

<style scoped>

</style>