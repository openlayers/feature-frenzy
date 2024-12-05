<script setup lang="ts">
/**
 * This makes it possible to display iframes without any scaling.
 * Slidev slides use the `--slidev-slide-scale` CSS variable in a
 * scale transform. Using the built-in `iframe` layout, iframes are
 * scaled by this transform. This layout works around that by resizing
 * the wrapping element and applying the inverse scale transform to
 * the iframe.
 * 
 * See https://github.com/slidevjs/slidev/issues/1920 for potential
 * support for unscaled iframes in Slidev.
 */

const props = defineProps<{
  url: string
}>();

const unscaledSize = 'calc(100% * var(--slidev-slide-scale))';
const unscaledTransform = 'scale(calc(1 / var(--slidev-slide-scale)))';
</script>

<template>
  <div class="h-full w-full">
    <div relative :style="{ width: unscaledSize, height: unscaledSize }">
      <iframe
        id="frame" class="w-full h-full"
        :src="url"
        :style="{ transform: unscaledTransform, transformOrigin: 'top left' }"
      />
    </div>
  </div>
</template>