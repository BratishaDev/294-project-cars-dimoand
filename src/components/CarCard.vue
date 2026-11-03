<script setup>
  defineProps({
    car: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
  })
</script>

<template>
  <v-card
    hover
    :to="`/car/${car.id}`"
  >
    <v-img
      :alt="car.displayName"
      cover
      height="230"
      :src="car.url?.[1] || car.url?.[0] || '/images/sports_car_placeholder.png'"
    />
    <v-card-text>
      <v-chip v-if="car.fuelSlug" class="mr-2" size="small">
        {{ car.fuelSlug }}
      </v-chip>
      <v-chip v-if="car.bodyTypeEn" size="small">
        {{ car.bodyTypeEn }}
      </v-chip>
    </v-card-text>

    <v-card-subtitle class="pb-4">
      {{ count }} {{ count > 1 ? 'versions' : 'version' }}
    </v-card-subtitle>
  </v-card>
</template>

<style scoped>

</style>
