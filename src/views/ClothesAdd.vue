<script setup>

</script>

<template>
  <div class="upload-block defShadow">
    <img src="@/assets/images/upload.svg" alt="upload">
    <span class="upload-block__span">Перетащите сюда или</span>
    <button>Выбрать</button>
  </div>
</template>

<style scoped>
.upload-block {
  border: dashed 2px #000000;
  display: flex;
  flex-direction: column;
  max-width: 696px;
  align-items: center;
  gap: 47px;
  padding: 154px 249px;
}

.upload-block__span {
  font-size: 24px;
  font-weight: bold;
  opacity: 0.5;

}
</style>