<template>
  <div
    ref="containerRef"
    class="w-full h-full flex items-center justify-center bg-gray-200"
  >
    <v-stage
      ref="stageRef"
      :config="{ width: stageWidth, height: stageHeight }"
      @wheel="onWheelZoom"
    >
      <v-layer ref="layerRef">
        <v-rect :config="artboardConfig" :istening="false" />

        <v-transformer />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import type Konva from "konva";

const containerRef = ref<HTMLElement | null>(null);
const stageRef = ref<any>(null);

const stageWidth = ref(0);
const stageHeight = ref(0);

// Artboard original size
const artboardOriginal = { width: 800, height: 600 };

const artboardConfig = reactive({
  x: 0,
  y: 0,
  width: artboardOriginal.width,
  height: artboardOriginal.height,
  fill: "#fff",
  stroke: "#ccc",
  strokeWidth: 2,
});

interface Shape {
  x: number;
  y: number;
  radius: number;
  fill: string;
  draggable: boolean;
}

const SCALE_BY = 1.05;
const onWheelZoom = (e: Konva.KonvaEventObject<WheelEvent>) => {
  if (!e.evt.ctrlKey && !e.evt.metaKey) return;
  e.evt.preventDefault();

  const stage = stageRef.value.getStage();
  const oldScale = stage.scaleX();
  const center = { x: stage.width() / 2, y: stage.height() / 2 };
  const direction = e.evt.deltaY < 0 ? 1 : -1;
  const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

  stage.scale({ x: newScale, y: newScale });
  stage.position({
    x: center.x - (center.x - stage.x()) * (newScale / oldScale),
    y: center.y - (center.y - stage.y()) * (newScale / oldScale),
  });
  stage.batchDraw();
};

// Resize stage from container
const updateStageSize = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  stageWidth.value = rect.width;
  stageHeight.value = rect.height;

  // Center artboard
  artboardConfig.x = (stageWidth.value - artboardConfig.width) / 2;
  artboardConfig.y = (stageHeight.value - artboardConfig.height) / 2;
};

onMounted(() => {
  nextTick(() => {
    updateStageSize();
    window.addEventListener("resize", updateStageSize);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateStageSize);
});
</script>
