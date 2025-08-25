<template>
  <div ref="containerRef" class="w-full h-full bg-gray-200 overflow-auto">
    <div
      :style="{
        width: scrollAreaWidth + 'px',
        height: scrollAreaHeight + 'px',
        minWidth: '100%',
        minHeight: '100%',
      }"
      class="relative flex items-center justify-center"
    >
      <v-stage
        ref="stageRef"
        :config="{
          width: scrollAreaWidth,
          height: scrollAreaHeight,
          scaleX: scale,
          scaleY: scale,
        }"
        @wheel="onWheelZoom"
      >
        <v-layer ref="layerRef">
          <v-rect :config="artboardConfig" :listening="false" />
          <v-transformer ref="transformerRef" />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup lang="ts">
import type Konva from "konva";

import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";

interface ArtBoard {
  width: number;
  height: number;
}

const props = withDefaults(
  defineProps<{
    artBoard?: ArtBoard;
  }>(),
  {
    artBoard: () => ({
      width: 800,
      height: 600,
    }),
  }
);

const containerRef = ref<HTMLDivElement | null>(null);
const stageRef = ref<Konva.Stage | null>(null);
const layerRef = ref<Konva.Layer | null>(null);
const transformerRef = ref<Konva.Transformer | null>(null);

const stageWidth = ref(0);
const stageHeight = ref(0);
const scale = ref(1);

const artboardConfig = reactive({
  x: 0,
  y: 0,
  width: props.artBoard.width,
  height: props.artBoard.height,
  fill: "#fff",
});

const scrollAreaWidth = computed(() => {
  const scaledArtboardWidth = props.artBoard.width * scale.value;
  const padding = 200;
  return Math.max(stageWidth.value, scaledArtboardWidth + padding);
});

const scrollAreaHeight = computed(() => {
  const scaledArtboardHeight = props.artBoard.height * scale.value;
  const padding = 50;
  return Math.max(stageHeight.value, scaledArtboardHeight + padding);
});

const SCALE_BY = 1.05;

const onWheelZoom = (e: Konva.KonvaEventObject<WheelEvent>) => {
  if (!e.evt.ctrlKey && !e.evt.metaKey) return;
  e.evt.preventDefault();

  const container = containerRef.value;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const mouseX = e.evt.clientX - containerRect.left;
  const mouseY = e.evt.clientY - containerRect.top;

  const oldScale = scale.value;
  const direction = e.evt.deltaY < 0 ? 1 : -1;
  const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

  const stageMouseX = (mouseX + container.scrollLeft) / oldScale;
  const stageMouseY = (mouseY + container.scrollTop) / oldScale;

  scale.value = newScale;

  const newScrollLeft = stageMouseX * newScale - mouseX;
  const newScrollTop = stageMouseY * newScale - mouseY;

  setArtBoardCenter();

  nextTick(() => {
    container.scrollLeft = Math.max(0, newScrollLeft);
    container.scrollTop = Math.max(0, newScrollTop);
  });
};

const setArtBoardCenter = () => {
  const scrollAreaCenterX = scrollAreaWidth.value / 2;
  const scrollAreaCenterY = scrollAreaHeight.value / 2;

  artboardConfig.x =
    (scrollAreaCenterX - (props.artBoard.width * scale.value) / 2) /
    scale.value;
  artboardConfig.y =
    (scrollAreaCenterY - (props.artBoard.height * scale.value) / 2) /
    scale.value;
};

const fitArtboardToContainer = () => {
  if (!containerRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const containerW = containerRect.width;
  const containerH = containerRect.height;

  const artboardW = props.artBoard.width;
  const artboardH = props.artBoard.height;

  const scaleX = containerW / (artboardW + 200);
  const scaleY = containerH / (artboardH + 200);
  scale.value = Math.min(scaleX, scaleY, 1);

  setArtBoardCenter();

  nextTick(() => {
    if (!containerRef.value) return;
    containerRef.value.scrollLeft = (scrollAreaWidth.value - containerW) / 2;
    containerRef.value.scrollTop = (scrollAreaHeight.value - containerH) / 2;
  });
};

const updateStageSize = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  stageWidth.value = rect.width;
  stageHeight.value = rect.height;

  setArtBoardCenter();
};

const resetView = () => {
  scale.value = 1;
  setArtBoardCenter();
};

onMounted(() => {
  nextTick(() => {
    updateStageSize();
    fitArtboardToContainer();
    window.addEventListener("resize", updateStageSize);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateStageSize);
});
</script>
