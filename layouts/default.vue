<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <LayoutNavbar />
    <div class="h-full flex-none overflow-y-auto">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
const colorMode = useColorMode();
colorMode.preference = "light";
</script>
