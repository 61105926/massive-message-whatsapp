<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})

const cardClass = computed(() =>
  `rounded-lg border bg-card text-card-foreground shadow-sm ${props.class}`
)
</script>