<template>
  <div class="w-full flex flex-col gap-2 overflow-y-auto">
    <div class="w-full p-2">
      <Input
        class="bg-white w-full"
        placeholder="Search"
        v-model="searchValue"
      />
    </div>
    <div class="w-full overflow-auto px-2">
      <div class="columns-2 gap-2">
        <div v-for="(image, i) in listImage" :key="i" class="mb-2">
          <img
            :src="image.small"
            draggable="true"
            class="w-full rounded-lg"
            @dragstart="onDragStart($event, image)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Image {
  small: string;
  regular: string;
}

const config = useRuntimeConfig();
const searchValue = ref<string>("vector");
const listImage = ref<Image[]>([]);

const getUpslash = async () => {
  const res: any = await $fetch(
    `https://api.unsplash.com/search/photos?page=1&query=${searchValue.value}`,
    {
      headers: {
        Authorization: `Client-ID ${config.public.unsplashApiKey}`,
      },
    }
  );

  listImage.value = await res.results.map((mp: { urls: Image }) => {
    return {
      small: mp.urls.small,
      regular: mp.urls.regular,
    };
  });
};

const onDragStart = (e: DragEvent, image: Image) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData("image/url", image.regular);
    e.dataTransfer.effectAllowed = "copy";
  }
};

onMounted(() => {
  getUpslash();
});
</script>
