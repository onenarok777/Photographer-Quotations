<template>
  <div class="flex w-full h-screen overflow-hidden">
    <div class="min-w-96 max-w-96 bg-slate-500 flex">
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
    <div class="h-full w-full overflow-auto flex flex-col">
      <div class="h-10">asd</div>
      <templateStage
        :art-board="{
          width: 1080,
          height: 1920,
        }"
      />
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
