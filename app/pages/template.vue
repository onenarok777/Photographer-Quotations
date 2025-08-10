<template>
  <div class="h-screen bg-slate-500 flex flex-col">
    <div>
      <TemplateMenuTop />
    </div>
    <div class="h-full flex">
      <div class="w-96">
        <TemplateMenuLeft />
      </div>
      <div class="flex-1">
        <TemplateStage />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>
