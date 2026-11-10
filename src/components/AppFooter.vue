<template>
  <v-footer>
    <slot>
      <div class="px-4 text-center w-100">
        <slot>{{ new Date().getFullYear() }} - Cars | Created by Andrii Dimov</slot>
      </div>
    </slot>
  </v-footer>
</template>

<script setup>

</script>

<style scoped>

</style>
