<script setup lang="ts">
import { type mangaType } from "../types"

defineProps<{
    manga: mangaType
}>()

</script>

<template>
    <li class="manga-item">
        <img tabindex="0" 
            class="manga-cover" 
            :src="manga.cover" 
            @click="$emit('getCovers', manga.id, manga.title)" 
            @keypress.enter = "$emit('getCovers', manga.id, manga.title)"
            alt="cover"
            width="150" />
        <p>{{ manga.title }}</p>
    </li>
</template>

<style scoped>
.manga-cover{
    cursor: pointer;
}
</style>