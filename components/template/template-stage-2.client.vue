<template>
  <div ref="containerRef" class="w-full h-full bg-gray-200 overflow-auto">
    <div
      class="relative flex items-center justify-center"
      :style="{
        width: scrollAreaWidth + 'px',
        height: scrollAreaHeight + 'px',
        minWidth: '100%',
        minHeight: '100%',
      }"
      @dragover.prevent
      @drop="onDropStage"
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
          <!-- <v-group :scaleX="scale" :scaleY="scale"> -->
          <v-rect :config="artboardConfig" :listening="false" />
          <v-transformer ref="transformerRef" />
          <v-image
            v-for="(img, i) in layerImages"
            :key="i"
            :image="imgObjMap[img.url]"
            :x="img.x"
            :y="img.y"
            draggable
          />
          <!-- </v-group> -->
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

interface LayerImage {
  url: string;
  x: number;
  y: number;
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

const stageWidth = ref<number>(0);
const stageHeight = ref<number>(0);
const scale = ref<number>(1);
const imgObjMap = ref<Record<string, HTMLImageElement>>({});
const layerImages = ref<LayerImage[]>([]);

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

const preloadImage = (url: string) => {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
  });
};

const onDropStage = async (e: DragEvent) => {
  e.preventDefault();
  if (!containerRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();

  const pointerX =
    (e.clientX - containerRect.left + containerRef.value.scrollLeft) /
    scale.value;
  const pointerY =
    (e.clientY - containerRect.top + containerRef.value.scrollTop) /
    scale.value;

  const url = e.dataTransfer?.getData("image/url");
  if (!url) return;

  if (!imgObjMap.value[url]) {
    imgObjMap.value[url] = await preloadImage(url);
  }

  layerImages.value.push({
    url,
    x: pointerX,
    y: pointerY,
  });
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
