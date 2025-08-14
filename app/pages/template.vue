<template>
  <div class="h-screen overflow-hidden">
    <div class="w-full h-10 bg-primary">asd</div>
    <div class="flex h-full">
      <div class="w-96 bg-slate-500 flex">
        <ul class="bg-slate-400 pl-1 py-1">
          <li
            v-for="(menu, i) in listMenus"
            :key="i"
            :class="[
              'w-10 h-10 flex justify-center items-center cursor-pointer rounded-l-lg',
              isActive == i ? 'bg-slate-500' : '',
            ]"
            @click="isActive = i"
          >
            {{ menu }}
          </li>
        </ul>
        <div class="flex-1">asd</div>
      </div>
      <div>flex</div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
});
const listMenus: string[] = ["a", "b"];
const isActive = ref<number>(0);
</script>
