<template>
  <Dropdown :items="listUserProfileMenus">
    <div class="btn btn-ghost btn-circle avatar">
      <div class="w-10 rounded-full">
        <img alt="image-nana-profile" src="/images/NaNa.jpg" />
      </div>
    </div>
  </Dropdown>
</template>
<script setup lang="ts">
import type { DropdownItem } from "~/types/dropdown";

const listUserProfileMenus: DropdownItem[] = [
  { label: "Profile" },
  { label: "Settings" },
  { label: "Logout" },
];
</script>
