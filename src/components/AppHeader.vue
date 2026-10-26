<template>
  <v-app-bar flat>
    <v-container class="d-flex align-center">
      <v-avatar
        class="mr-4 pa-0 cursor-pointer"
        :image="isHovered ? logoGif : logoStatic"
        size="64"
        @click="$router.push('/')"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      />
      <v-toolbar-title>Cars</v-toolbar-title>
      <v-btn
        v-for="link in menuItems"
        :key="link.title"
        :icon="link.icon"
        :to="link.path"
      />
    </v-container>
  </v-app-bar>
</template>

<script setup>
  import logoGif from '@/assets/cars_logo_animated.gif'
  import logoStatic from '@/assets/cars_logo_static.png'
  const menuItems = [
    { title: 'Accueil', path: '/', icon: 'mdi-car' },
    { title: 'Favoris', path: '/favoris', icon: 'mdi-heart' },
    { title: 'À propos', path: '/a-propos', icon: 'mdi-information' },
  ]
  const isHovered = ref(false)
</script>
