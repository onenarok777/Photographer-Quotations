<template>
  <div ref="container" class="overflow-hidden"></div>
</template>

<script setup lang="ts">
import Konva from "konva";

const container = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  await nextTick();
  if (!container.value) return;

  const containerWidth = container.value.clientWidth;
  const containerHeight = container.value.clientHeight || window.innerHeight; // fallback if height = 0

  const stage = new Konva.Stage({
    container: container.value,
    width: containerWidth,
    height: containerHeight,
  });

  container.value.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    // ใส่โค้ดเปิด context menu ของคุณเองที่นี่ ถ้ามี
  });

  window.addEventListener("resize", () => {
    const w = container.value?.clientWidth || window.innerWidth;
    const h = container.value?.clientHeight || window.innerHeight;
    stage.width(w);
    stage.height(h);
    stage.draw();
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const frame = new Konva.Rect({
    x: 800 / 2,
    y: 100,
    width: 800,
    height: 800,
    fill: "#ffffff",
    draggable: true,
  });

  layer.add(frame);
  layer.draw();
});
</script>
