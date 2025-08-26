<template>
  <div ref="containerRef" class="w-full h-full bg-red-200">
    <v-stage
      ref="stageRef"
      :config="{
        width: stageConfig.width,
        height: stageConfig.height,
        draggable: false,
      }"
      @mousedown="onStageMouseDown"
      @mousemove="onStageMouseMove"
      @mouseup="onStageMouseUp"
      @mouseleave="onStageMouseUp"
      @wheel="onWheel"
    >
      <v-layer ref="layerRef">
        <v-rect :config="artboardConfig" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import type Konva from "konva";

const containerRef = ref<HTMLDivElement | null>(null);
const stageRef = ref<Konva.Stage | null>(null);
const layerRef = ref<Konva.Layer | null>(null);

const artboardWidth = 400;
const artboardHeight = 300;

const stageConfig = reactive({
  width: 0,
  height: 0,
});

const artboardConfig = reactive({
  x: 0,
  y: 0,
  width: artboardWidth,
  height: artboardHeight,
  fill: "#fff",
  stroke: "#000",
  strokeWidth: 2,
  cornerRadius: 8,
});

// Track dragging
let isDragging = false;
let lastPos = { x: 0, y: 0 };

const onStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (!stageRef.value) return;
  if (e.evt.metaKey) {
    isDragging = true;
    lastPos = { x: e.evt.clientX, y: e.evt.clientY };
  }
};

const onStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (!isDragging || !stageRef.value) return;

  const stage = stageRef.value.getStage(); // <-- ต้องเอา stage จริง
  if (!stage) return;

  const dx = e.evt.clientX - lastPos.x;
  const dy = e.evt.clientY - lastPos.y;

  stage.x(stage.x() + dx);
  stage.y(stage.y() + dy);
  stage.batchDraw();

  lastPos = { x: e.evt.clientX, y: e.evt.clientY };
};

const onStageMouseUp = () => {
  isDragging = false;
};

const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault();
  if (!stageRef.value) return;

  const stage = stageRef.value.getStage(); // เอา instance จริง
  if (!stage) return;

  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  const scaleBy = 1.1;
  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

  stage.scale({ x: newScale, y: newScale });

  const mousePointTo = {
    x: pointer.x / oldScale - stage.x() / oldScale,
    y: pointer.y / oldScale - stage.y() / oldScale,
  };

  stage.x(pointer.x - mousePointTo.x * newScale);
  stage.y(pointer.y - mousePointTo.y * newScale);

  stage.batchDraw();
};

onMounted(async () => {
  await nextTick();

  const resize = () => {
    if (!containerRef.value) return;
    stageConfig.width = containerRef.value.clientWidth;
    stageConfig.height = containerRef.value.clientHeight;

    // Center artboard
    artboardConfig.x = (stageConfig.width - artboardWidth) / 2;
    artboardConfig.y = (stageConfig.height - artboardHeight) / 2;
  };

  resize();
  window.addEventListener("resize", resize);
});
</script>
