<template>
  <div ref="containerRef" class="h-full w-full"></div>
</template>

<script setup lang="ts">
import Konva from "konva";
import { ref, onMounted, nextTick } from "vue";

const containerRef = ref<HTMLDivElement | null>(null);
const artboardWidth = ref<number>(794);
const artboardHeight = ref<number>(1123);

let stage: Konva.Stage;
let layer: Konva.Layer;
let content: Konva.Group;
let transformer: Konva.Transformer | null = null;

const initialScale = 0.7;
const gridSize = 10;
const snapDistance = 5;

function initStage(): void {
  if (!containerRef.value) return;

  const containerWidth = containerRef.value.clientWidth;
  const containerHeight = containerRef.value.clientHeight;

  const offsetX = (containerWidth - artboardWidth.value * initialScale) / 2;
  const offsetY = (containerHeight - artboardHeight.value * initialScale) / 2;

  // 1. สร้าง Stage
  stage = new Konva.Stage({
    container: containerRef.value,
    width: containerWidth,
    height: containerHeight,
    draggable: true,
  });

  // 2. สร้าง Layer
  layer = new Konva.Layer();

  // 3. สร้าง Group สำหรับ Content
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
  stage.add(layer);
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

  containerRef.value!.addEventListener("wheel", (e: WheelEvent) => {
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

// function setupContextMenuBlock(): void {
//   container.value!.addEventListener("contextmenu", (e: MouseEvent) => {
//     e.preventDefault();
//   });
// }

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
          // newTransformer(konvaImage);
        });
        // enableSnap(konvaImage);
        content.add(konvaImage);
        layer.draw();
      };

      imageObj.src = url;
    }
  });
}

// function newTransformer(node: Konva.Node) {
//   if (!layer) return;

//   if (transformer) {
//     transformer.destroy();
//     transformer = null;
//   }

//   transformer = new Konva.Transformer({
//     nodes: [node],
//     enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
//     boundBoxFunc: (oldBox, newBox) => newBox,
//   });

//   layer.add(transformer);
//   layer.draw();
// }

// function removeTransformer() {
//   if (transformer) {
//     transformer.destroy();
//     transformer = null;
//     layer.draw();
//   }
// }

// function setupEscToCancel() {
//   window.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") {
//       removeTransformer();
//     }
//   });
// }

// function enableSnap(node: Konva.Node) {
//   node.on("dragmove", () => {
//     const pos = node.position();
//     let newX = pos.x;
//     let newY = pos.y;

//     // Snap to grid
//     const gridX = Math.round(pos.x / gridSize) * gridSize;
//     const gridY = Math.round(pos.y / gridSize) * gridSize;

//     if (Math.abs(pos.x - gridX) < snapDistance) {
//       newX = gridX;
//     }
//     if (Math.abs(pos.y - gridY) < snapDistance) {
//       newY = gridY;
//     }

//     // Snap to artboard edges
//     const artRight = artboardWidth.value - node.width();
//     const artBottom = artboardHeight.value - node.height();

//     if (Math.abs(newX) < snapDistance) newX = 0;
//     if (Math.abs(newY) < snapDistance) newY = 0;
//     if (Math.abs(newX - artRight) < snapDistance) newX = artRight;
//     if (Math.abs(newY - artBottom) < snapDistance) newY = artBottom;

//     node.position({ x: newX, y: newY });
//   });
// }

onMounted(async () => {
  await nextTick();
  if (!containerRef.value) return;

  initStage();
  createArtboard();
  setupZoomHandler();
  // setupContextMenuBlock();
  handlePasteImageFromClipboard();

  // setupEscToCancel();
});
</script>
