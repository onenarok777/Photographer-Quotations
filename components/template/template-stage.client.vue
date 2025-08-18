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
// let transformer: Konva.Transformer | null = null;

const initialScale = 0.7;
const gridSize = 10;
const snapDistance = 5;

function initStage(): void {
  if (!containerRef.value) return;

  const containerWidth = containerRef.value.clientWidth;
  const containerHeight = containerRef.value.clientHeight;

  const offsetX = (containerWidth - artboardWidth.value * initialScale) / 2;
  const offsetY = (containerHeight - artboardHeight.value * initialScale) / 2;

  stage = new Konva.Stage({
    container: containerRef.value,
    width: containerWidth,
    height: containerHeight,
    draggable: true,
  });

  layer = new Konva.Layer();
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
      if (!item.type.startsWith("image")) continue;

      const blob = item.getAsFile();
      if (!blob) continue;

      const url = URL.createObjectURL(blob);

      // วางตรงกลาง Stage
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const x = stageWidth / 2;
      const y = stageHeight / 2;

      const img = new window.Image();
      img.onload = () => {
        const konvaImage = new Konva.Image({
          image: img,
          x,
          y,
          width: img.width / 2,
          height: img.height / 2,
          draggable: true,
        });
        layer.add(konvaImage);
        enableSnap(konvaImage);
        layer.draw();
      };
      img.src = url;
    }
  });
}

function handleDropImage(): void {
  if (!containerRef.value) return;

  containerRef.value.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  containerRef.value.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;

    if (files && files.length > 0) {
      for (const file of files) {
        if (!file.type.startsWith("image")) continue;
        const url = URL.createObjectURL(file);
        addImageToLayer(e, url);
      }
    } else {
      const uri = e.dataTransfer?.getData("text/uri-list");
      if (uri) addImageToLayer(e, uri);
    }
  });
}

const addImageToLayer = (e: DragEvent, url: string) => {
  const rect = containerRef.value!.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const img = new window.Image();
  img.onload = () => {
    const width = img.width / 2;
    const height = img.height / 2;

    // ให้เมาส์อยู่ตรงกลางภาพ
    const konvaImage = new Konva.Image({
      image: img,
      x: mouseX - width / 2,
      y: mouseY - height / 2,
      width,
      height,
      draggable: true,
    });

    content.add(konvaImage);
    enableSnap(konvaImage);
    layer.draw();
  };
  img.src = url;
};

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

function enableSnap(node: Konva.Node) {
  node.on("dragmove", () => {
    // local position ภายใน content
    const scale = content.scaleX(); // assume scaleX = scaleY
    const localX = (node.x() - 0) / scale; // node.x() เทียบกับ content
    const localY = (node.y() - 0) / scale;

    let newX = localX;
    let newY = localY;

    // Snap to grid
    const gridX = Math.round(localX / gridSize) * gridSize;
    const gridY = Math.round(localY / gridSize) * gridSize;

    if (Math.abs(localX - gridX) < snapDistance) newX = gridX;
    if (Math.abs(localY - gridY) < snapDistance) newY = gridY;

    // Snap to artboard edges
    const artRight = artboardWidth.value - node.width() / scale;
    const artBottom = artboardHeight.value - node.height() / scale;

    if (Math.abs(newX) < snapDistance) newX = 0;
    if (Math.abs(newY) < snapDistance) newY = 0;
    if (Math.abs(newX - artRight) < snapDistance) newX = artRight;
    if (Math.abs(newY - artBottom) < snapDistance) newY = artBottom;

    // กลับเป็น global position ของ content
    node.position({
      x: newX * scale,
      y: newY * scale,
    });
  });
}

onMounted(async () => {
  await nextTick();
  if (!containerRef.value) return;

  initStage();
  createArtboard();
  setupZoomHandler();
  // setupContextMenuBlock();
  handlePasteImageFromClipboard();
  handleDropImage();

  // setupEscToCancel();
});
</script>
