<script setup>
  defineProps({
    car: {
      type: Object,
      required: true,
    },
  })
</script>

<template>
  <v-card
    hover
  >
    <v-img
      :alt="car.displayName"
      cover
      height="220"
      :src="car.url?.[1] || car.url?.[0] || '/images/sports_car_placeholder.png'"
    />
    <v-card-title>{{ car.displayName }}</v-card-title>
    <v-card-subtitle>Power {{ car.powerHp }} HP</v-card-subtitle>
  </v-card>
</template>

<style scoped>

</style>
