<template>
  <div
    ref="container"
    class="overflow-hidden w-full h-screen bg-slast-dark"
  ></div>
</template>

<script setup lang="ts">
import Konva from "konva";
import { ref, onMounted, nextTick } from "vue";

const container = ref<HTMLDivElement | null>(null);
const artboardWidth = ref<number>(794);
const artboardHeight = ref<number>(1123);

let stage: Konva.Stage;
let layer: Konva.Layer;
let content: Konva.Group;
let transformer: Konva.Transformer | null = null;

function initStage(): void {
  const containerEl = container.value;
  if (!containerEl) return;

  const containerWidth = containerEl.clientWidth;
  const containerHeight = containerEl.clientHeight || window.innerHeight;

  stage = new Konva.Stage({
    container: containerEl,
    width: containerWidth,
    height: containerHeight,
    draggable: true,
  });

  layer = new Konva.Layer();
  stage.add(layer);

  // 🔍 Fit & scale
  const scaleX = containerWidth / artboardWidth.value;
  const scaleY = containerHeight / artboardHeight.value;
  const baseScale = Math.min(scaleX, scaleY);
  const initialScale = baseScale * 0.9;

  const offsetX = (containerWidth - artboardWidth.value * initialScale) / 2;
  const offsetY = (containerHeight - artboardHeight.value * initialScale) / 2;

  content = new Konva.Group({
    x: offsetX,
    y: offsetY,
    scaleX: initialScale,
    scaleY: initialScale,
    clip: {
      x: 0,
      y: 0,
      width: artboardWidth.value,
      height: artboardHeight.value,
    },
  });

  layer.add(content);
  layer.draw();
}

function createArtboard(): void {
  const artBoard: Konva.Rect = new Konva.Rect({
    x: 0,
    y: 0,
    width: artboardWidth.value,
    height: artboardHeight.value,
    fill: "#fff",
    strokeWidth: 0,
  });

  content.add(artBoard);
  layer.draw();
}

function setupZoomHandler(): void {
  const minScale = 0.5;
  const maxScale = 5;

  container.value!.addEventListener("wheel", (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();

    const oldScale = content.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const finalScale = Math.max(minScale, Math.min(maxScale, newScale));

    const mousePointTo = {
      x: (pointer.x - content.x()) / oldScale,
      y: (pointer.y - content.y()) / oldScale,
    };

    content.scale({ x: finalScale, y: finalScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * finalScale,
      y: pointer.y - mousePointTo.y * finalScale,
    };

    content.position(newPos);
    layer.batchDraw();
  });
}

function setupContextMenuBlock(): void {
  container.value!.addEventListener("contextmenu", (e: MouseEvent) => {
    e.preventDefault();
  });
}

function handlePasteImageFromClipboard(): void {
  window.addEventListener("paste", async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf("image") === -1) continue;

      const blob = item.getAsFile();
      if (!blob) continue;

      const url = URL.createObjectURL(blob);
      const imageObj = new window.Image();

      imageObj.onload = () => {
        const konvaImage = new Konva.Image({
          image: imageObj,
          x: 50,
          y: 50,
          width: imageObj.width,
          height: imageObj.height,
          draggable: true,
        });
        konvaImage.on("click", (e) => {
          e.cancelBubble = true;
          newTransformer(konvaImage);
        });
        content.add(konvaImage);
        layer.draw();
      };

      imageObj.src = url;
    }
  });
}

function newTransformer(node: Konva.Node) {
  if (!layer) return;

  if (transformer) {
    transformer.destroy();
    transformer = null;
  }

  transformer = new Konva.Transformer({
    nodes: [node],
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
    boundBoxFunc: (oldBox, newBox) => newBox,
  });

  layer.add(transformer);
  layer.draw();
}

function removeTransformer() {
  if (transformer) {
    transformer.destroy();
    transformer = null;
    layer.draw();
  }
}

function setupSelectionHandler(stage: Konva.Stage, content: Konva.Group) {
  stage.on("click", (e) => {
    const clickedOnEmpty = e.target === stage || e.target === content;
    if (clickedOnEmpty) {
      removeTransformer();
    }
  });
}

function setupEscToCancel() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      removeTransformer();
    }
  });
}

onMounted(async () => {
  await nextTick();
  if (!container.value) return;

  initStage();
  createArtboard();
  setupZoomHandler();
  setupContextMenuBlock();
  handlePasteImageFromClipboard();
  setupSelectionHandler(stage, content);
  setupEscToCancel();
});
</script>
