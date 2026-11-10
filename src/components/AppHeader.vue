<template>
  <v-app-bar flat>
    <v-container class="d-flex align-center">
      <!--
        Logo cliquable. Un <div> n'est pas focusable par défaut : tabindex="0" + role="link" + @keydown.enter
        le rendent utilisable au clavier, et aria-label donne son nom aux lecteurs d'écran.
      -->
      <v-avatar
        aria-label="Retour à l'accueil"
        class="mr-4 pa-0 cursor-pointer"
        :image="isHovered ? logoGif : logoStatic"
        role="link"
        size="64"
        tabindex="0"
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      />
      <v-toolbar-title>Cars</v-toolbar-title>
      <!-- Boutons à icône seule : sans aria-label ils n'ont aucun nom pour un lecteur d'écran -->
      <v-btn
        v-for="link in menuItems"
        :key="link.title"
        :aria-label="link.title"
        color="primary"
        :icon="link.icon"
        :title="link.title"
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
  // true quand la souris est sur le logo → on affiche le GIF animé à la place du PNG statique
  const isHovered = ref(false)
</script>
