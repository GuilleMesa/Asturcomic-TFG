import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header/Header";
import { AvatarPreview } from "../../components/AvatarPreview/AvatarPreview";
import { AssetSelectorPanel } from "../../components/AssetSelectorPanel/AssetSelectorPanel";
import { BoxControlsPanel } from "../../components/BoxControlsPanel/BoxControlsPanel";
import {
  BROW_COLOR_OPTIONS,
  DEFAULT_BROW_COLOR,
  DEFAULT_HAIR_COLOR,
  HAIR_COLOR_OPTIONS,
} from "../../constants/hairColors";
import { fetchCatalog } from "../../services/catalogService";
import type {
  Box,
  CanvasSize,
  Catalog,
  CompositeAsset,
  SelectableCategory,
  SelectedAvatar,
} from "../../types/avatar";
import { pageStyles } from "./AvatarEditorPage.styles";

const DEFAULT_CANVAS: CanvasSize = { w: 2048, h: 2048 };

const SELECTABLE_CATEGORIES: SelectableCategory[] = [
  "heads",
  "leftEars",
  "rightEars",
  "hairs",
  "leftEyes",
  "rightEyes",
  "leftLashes",
  "rightLashes",
  "leftBrows",
  "rightBrows",
  "noses",
  "mouths",
];

const EMPTY_SELECTION: SelectedAvatar = {
  heads: "",
  leftEars: "",
  rightEars: "",
  hairs: "",
  leftEyes: "",
  rightEyes: "",
  leftLashes: "",
  rightLashes: "",
  leftBrows: "",
  rightBrows: "",
  noses: "",
  mouths: "",
};

function createFullBox(canvas: CanvasSize): Box {
  return { x: 0, y: 0, w: canvas.w, h: canvas.h };
}

function createInitialSelection(catalog: Catalog): SelectedAvatar {
  const selection = { ...EMPTY_SELECTION };

  SELECTABLE_CATEGORIES.forEach((category) => {
    selection[category] = catalog[category][0]?.id ?? "";
  });

  return selection;
}

function findSelectedAsset(
  catalog: Catalog | null,
  category: SelectableCategory,
  id: string
): CompositeAsset | undefined {
  return catalog?.[category].find((item) => item.id === id);
}

export function AvatarEditorPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [selected, setSelected] = useState<SelectedAvatar>(EMPTY_SELECTION);
  const [hairColor, setHairColor] = useState(DEFAULT_HAIR_COLOR);
  const [browColor, setBrowColor] = useState(DEFAULT_BROW_COLOR);
  const [faceBox, setFaceBox] = useState<Box>(createFullBox(DEFAULT_CANVAS));

  useEffect(() => {
    fetchCatalog()
      .then((data) => {
        setCatalog(data);
        setSelected(createInitialSelection(data));
        setFaceBox(createFullBox(data.canvas));
      })
      .catch((err) => {
        console.error("Error cargando catálogo:", err);
      });
  }, []);

  const headItem = useMemo(
    () => findSelectedAsset(catalog, "heads", selected.heads),
    [catalog, selected.heads]
  );

  const leftEarItem = useMemo(
    () => findSelectedAsset(catalog, "leftEars", selected.leftEars),
    [catalog, selected.leftEars]
  );

  const rightEarItem = useMemo(
    () => findSelectedAsset(catalog, "rightEars", selected.rightEars),
    [catalog, selected.rightEars]
  );

  const hairItem = useMemo(
    () => findSelectedAsset(catalog, "hairs", selected.hairs),
    [catalog, selected.hairs]
  );

  const leftEyeItem = useMemo(
    () => findSelectedAsset(catalog, "leftEyes", selected.leftEyes),
    [catalog, selected.leftEyes]
  );

  const rightEyeItem = useMemo(
    () => findSelectedAsset(catalog, "rightEyes", selected.rightEyes),
    [catalog, selected.rightEyes]
  );

  const leftLashItem = useMemo(
    () => findSelectedAsset(catalog, "leftLashes", selected.leftLashes),
    [catalog, selected.leftLashes]
  );

  const rightLashItem = useMemo(
    () => findSelectedAsset(catalog, "rightLashes", selected.rightLashes),
    [catalog, selected.rightLashes]
  );

  const leftBrowItem = useMemo(
    () => findSelectedAsset(catalog, "leftBrows", selected.leftBrows),
    [catalog, selected.leftBrows]
  );

  const rightBrowItem = useMemo(
    () => findSelectedAsset(catalog, "rightBrows", selected.rightBrows),
    [catalog, selected.rightBrows]
  );

  const noseItem = useMemo(
    () => findSelectedAsset(catalog, "noses", selected.noses),
    [catalog, selected.noses]
  );

  const mouthItem = useMemo(
    () => findSelectedAsset(catalog, "mouths", selected.mouths),
    [catalog, selected.mouths]
  );

  function handleSelectionChange(category: SelectableCategory, id: string) {
    setSelected((prev) => ({ ...prev, [category]: id }));
  }

  return (
    <div style={pageStyles.wrapper}>
      <Header />

      <main style={pageStyles.content}>
        <AssetSelectorPanel
          catalog={catalog}
          selected={selected}
          hairColor={hairColor}
          hairColorOptions={HAIR_COLOR_OPTIONS}
          browColor={browColor}
          browColorOptions={BROW_COLOR_OPTIONS}
          onSelectionChange={handleSelectionChange}
          onHairColorChange={setHairColor}
          onBrowColorChange={setBrowColor}
        />

        <AvatarPreview
          canvas={catalog?.canvas ?? DEFAULT_CANVAS}
          leftEar={leftEarItem}
          rightEar={rightEarItem}
          head={headItem}
          hair={hairItem}
          leftEye={leftEyeItem}
          rightEye={rightEyeItem}
          leftLash={leftLashItem}
          rightLash={rightLashItem}
          leftBrow={leftBrowItem}
          rightBrow={rightBrowItem}
          nose={noseItem}
          mouth={mouthItem}
          hairColor={hairColor}
          browColor={browColor}
          faceBox={faceBox}
        />

        <BoxControlsPanel
          canvas={catalog?.canvas ?? DEFAULT_CANVAS}
          faceBox={faceBox}
          setFaceBox={setFaceBox}
        />
      </main>
    </div>
  );
}
