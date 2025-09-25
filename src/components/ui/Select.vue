<template>
  <select
    :value="modelValue"
    @input="updateValue"
    :class="selectClasses"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectClasses = computed(() => [
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring',
  props.class
].filter(Boolean).join(' '))

const updateValue = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>