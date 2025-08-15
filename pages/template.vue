<template>
  <div class="h-screen overflow-hidden">
    <div class="w-full h-10 bg-blue-500 flex items-center p-2">asd</div>
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
            {{ menu.label }}
          </li>
        </ul>
        <component :is="listMenus[isActive]?.component" />
      </div>
      <div class="bg-green-500 flex-1">
        <templateStage />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import templateUnsplash from "~/components/template/template-unsplash.vue";
definePageMeta({
  layout: false,
});

const listMenus = [
  {
    label: "U",
    component: templateUnsplash,
  },
];

const isActive = ref<number>(0);
</script>
