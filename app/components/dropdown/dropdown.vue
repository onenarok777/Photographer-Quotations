<template>
  <div :class="['dropdown', position]">
    <div tabindex="0">
      <slot />
    </div>

    <ul
      class="menu menu-md dropdown-content bg-base-300 rounded-box z-1 mt-2 min-w-52 p-2 shadow"
    >
      <li v-for="(item, i) in props.items" :key="i">
        <a>{{ item.label }}</a>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import type { DropdownProps } from "~/types/dropdown";

const props = withDefaults(defineProps<DropdownProps>(), {
  position: "bottom-left",
  items: () => [],
});

const position = computed<string | undefined>(() => {
  const positions: Record<string, string> = {
    "top-left": "dropdown-top dropdown-start",
    "top-center": "dropdown-top dropdown-center",
    "top-right": "dropdown-top dropdown-end",
    "left-top": "dropdown-left dropdown-top",
    "left-center": "dropdown-left dropdown-center",
    "left-bottom": "dropdown-left dropdown-bottom",
    "right-top": "dropdown-right dropdown-top",
    "right-center": "dropdown-right dropdown-center",
    "right-bottom": "dropdown-right dropdown-bottom",
    "bottom-left": "dropdown-bottom dropdown-end",
    "bottom-center": "dropdown-bottom dropdown-center",
    "bottom-right": "dropdown-bottom dropdown-start",
  };
  return positions[props.position];
});
</script>
