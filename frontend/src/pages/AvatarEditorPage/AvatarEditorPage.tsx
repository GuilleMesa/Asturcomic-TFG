import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header/Header";
import { AvatarPreview } from "../../components/AvatarPreview/AvatarPreview";
import { AssetSelectorPanel } from "../../components/AssetSelectorPanel/AssetSelectorPanel";
import { SpeechBubblePanel } from "../../components/SpeechBubblePanel/SpeechBubblePanel";
import {
  BROW_COLOR_OPTIONS,
  DEFAULT_BROW_COLOR,
  DEFAULT_HAIR_COLOR,
  DEFAULT_SKIN_COLOR,
  HAIR_COLOR_OPTIONS,
  SKIN_COLOR_OPTIONS,
} from "../../constants/hairColors";
import {
  downloadBlob,
  renderAvatarPngBlob,
} from "../../services/avatarExportService";
import { fetchCatalog } from "../../services/catalogService";
import type {
  AvatarConfigFile,
  Box,
  CanvasSize,
  Catalog,
  CompositeAsset,
  Gender,
  SelectableCategory,
  SelectedAvatar,
} from "../../types/avatar";
import { pageStyles } from "./AvatarEditorPage.styles";

const DEFAULT_CANVAS: CanvasSize = { w: 2836, h: 3055 };
const DEFAULT_GENDER: Gender = "male";
const EMPTY_SPEECH_BUBBLE_ID = "sin-bocadillo";
const CONFIG_APP_ID = "asturcomic-avatar";
const CONFIG_VERSION = 1;

const SELECTABLE_CATEGORIES: SelectableCategory[] = [
  "poses",
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
  poses: "",
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

function isFullWidthSpeechBubble(asset?: CompositeAsset): boolean {
  if (!asset) return false;

  return asset.id.includes("narrador") || asset.id.includes("rectangular");
}

function createDefaultSpeechBubbleBox(
  canvas: CanvasSize,
  asset?: CompositeAsset
): Box {
  const aspect = asset?.canvas ? asset.canvas.w / asset.canvas.h : 1.8;

  if (isFullWidthSpeechBubble(asset)) {
    return {
      x: 0,
      y: 0,
      w: canvas.w,
      h: Math.min(Math.round(canvas.w / aspect), canvas.h),
    };
  }

  const width = Math.round(canvas.w * 0.34);
  const height = Math.round(width / aspect);

  return {
    x: Math.round(canvas.w * 0.06),
    y: Math.round(canvas.h * 0.07),
    w: width,
    h: height,
  };
}

function getDefaultPoseId(catalog: Catalog, gender: Gender): string {
  const defaultPoseId = catalog.defaultPoseByGender?.[gender];

  if (defaultPoseId && catalog.poses.some((pose) => pose.id === defaultPoseId)) {
    return defaultPoseId;
  }

  const fallbackGender = gender === "female" ? "female" : "male";
  return (
    catalog.poses.find((pose) => pose.gender === fallbackGender)?.id ??
    catalog.poses[0]?.id ??
    ""
  );
}

function createInitialSelection(
  catalog: Catalog,
  gender = DEFAULT_GENDER
): SelectedAvatar {
  const selection = { ...EMPTY_SELECTION };

  SELECTABLE_CATEGORIES.forEach((category) => {
    selection[category] = catalog[category][0]?.id ?? "";
  });

  selection.poses = getDefaultPoseId(catalog, gender);

  return selection;
}

function findSelectedAsset(
  catalog: Catalog | null,
  category: SelectableCategory,
  id: string
): CompositeAsset | undefined {
  return catalog?.[category].find((item) => item.id === id);
}

function getCategoryOptions(
  catalog: Catalog,
  category: SelectableCategory,
  gender: Gender
): CompositeAsset[] {
  const options = catalog[category];

  if (category !== "poses" || gender === "nonBinary") {
    return options;
  }

  return options.filter((asset) => asset.gender === gender);
}

function pickRandomId(
  catalog: Catalog,
  category: SelectableCategory,
  gender: Gender
): string {
  const options = getCategoryOptions(catalog, category, gender);
  const randomIndex = Math.floor(Math.random() * options.length);

  return options[randomIndex]?.id ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isGender(value: unknown): value is Gender {
  return value === "male" || value === "female" || value === "nonBinary";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function createDownloadFileName(extension: "png" | "json"): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `asturcomic-avatar-${stamp}.${extension}`;
}

function readBox(value: unknown, fallback: Box, canvas: CanvasSize): Box {
  if (!isRecord(value)) return fallback;

  const rawX = Number(value.x);
  const rawY = Number(value.y);
  const rawW = Number(value.w);
  const rawH = Number(value.h);
  const w = Math.min(
    Math.max(Math.round(Number.isFinite(rawW) ? rawW : fallback.w), 1),
    canvas.w
  );
  const h = Math.min(
    Math.max(Math.round(Number.isFinite(rawH) ? rawH : fallback.h), 1),
    canvas.h
  );

  return {
    x: Math.min(
      Math.max(Math.round(Number.isFinite(rawX) ? rawX : fallback.x), 0),
      canvas.w - w
    ),
    y: Math.min(
      Math.max(Math.round(Number.isFinite(rawY) ? rawY : fallback.y), 0),
      canvas.h - h
    ),
    w,
    h,
  };
}

function createSelectionFromConfig(
  rawConfig: Record<string, unknown>,
  catalog: Catalog,
  gender: Gender
): SelectedAvatar {
  const rawSelected = isRecord(rawConfig.selected) ? rawConfig.selected : {};
  const selection = createInitialSelection(catalog, gender);

  SELECTABLE_CATEGORIES.forEach((category) => {
    const id = rawSelected[category];

    if (
      typeof id === "string" &&
      catalog[category].some((asset) => asset.id === id)
    ) {
      selection[category] = id;
    }
  });

  const selectedPose = catalog.poses.find((pose) => pose.id === selection.poses);
  if (gender !== "nonBinary" && selectedPose?.gender !== gender) {
    selection.poses = getDefaultPoseId(catalog, gender);
  }

  return selection;
}

export function AvatarEditorPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [selected, setSelected] = useState<SelectedAvatar>(EMPTY_SELECTION);
  const [gender, setGender] = useState<Gender>(DEFAULT_GENDER);
  const [skinColor, setSkinColor] = useState(DEFAULT_SKIN_COLOR);
  const [hairColor, setHairColor] = useState(DEFAULT_HAIR_COLOR);
  const [browColor, setBrowColor] = useState(DEFAULT_BROW_COLOR);
  const [isExporting, setIsExporting] = useState(false);
  const [faceBox, setFaceBox] = useState<Box>(createFullBox(DEFAULT_CANVAS));
  const [selectedSpeechBubbleId, setSelectedSpeechBubbleId] = useState(
    EMPTY_SPEECH_BUBBLE_ID
  );
  const [speechBubbleBox, setSpeechBubbleBox] = useState<Box>(
    createDefaultSpeechBubbleBox(DEFAULT_CANVAS)
  );

  useEffect(() => {
    fetchCatalog()
      .then((data) => {
        setCatalog(data);
        setSelected(createInitialSelection(data, DEFAULT_GENDER));
        setFaceBox(createFullBox(data.canvas));
        setSpeechBubbleBox(createDefaultSpeechBubbleBox(data.canvas));
      })
      .catch((err) => {
        console.error("Error cargando catálogo:", err);
      });
  }, []);

  const headItem = useMemo(
    () => findSelectedAsset(catalog, "heads", selected.heads),
    [catalog, selected.heads]
  );

  const poseItem = useMemo(
    () => findSelectedAsset(catalog, "poses", selected.poses),
    [catalog, selected.poses]
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

  const speechBubbleItem = useMemo(
    () =>
      catalog?.speechBubbles.find(
        (item) => item.id === selectedSpeechBubbleId
      ),
    [catalog, selectedSpeechBubbleId]
  );

  function handleSelectionChange(category: SelectableCategory, id: string) {
    setSelected((prev) => ({ ...prev, [category]: id }));
  }

  function handleSpeechBubbleSelect(id: string) {
    setSelectedSpeechBubbleId(id);

    if (!catalog || id === EMPTY_SPEECH_BUBBLE_ID) return;

    const nextSpeechBubble = catalog.speechBubbles.find(
      (item) => item.id === id
    );
    setSpeechBubbleBox(
      createDefaultSpeechBubbleBox(catalog.canvas, nextSpeechBubble)
    );
  }

  function handleGenderChange(nextGender: Gender) {
    setGender(nextGender);

    if (!catalog) return;

    setSelected((prev) => ({
      ...prev,
      poses: getDefaultPoseId(catalog, nextGender),
    }));
  }

  function handleReset() {
    if (!catalog) return;

    setGender(DEFAULT_GENDER);
    setSelected(createInitialSelection(catalog, DEFAULT_GENDER));
    setSkinColor(DEFAULT_SKIN_COLOR);
    setHairColor(DEFAULT_HAIR_COLOR);
    setBrowColor(DEFAULT_BROW_COLOR);
    setFaceBox(createFullBox(catalog.canvas));
    setSelectedSpeechBubbleId(EMPTY_SPEECH_BUBBLE_ID);
    setSpeechBubbleBox(createDefaultSpeechBubbleBox(catalog.canvas));
  }

  function handleRandomize() {
    if (!catalog) return;

    const nextSelection = { ...EMPTY_SELECTION };

    SELECTABLE_CATEGORIES.forEach((category) => {
      nextSelection[category] = pickRandomId(catalog, category, gender);
    });

    const randomHairColor =
      HAIR_COLOR_OPTIONS[
        Math.floor(Math.random() * HAIR_COLOR_OPTIONS.length)
      ]?.value ?? DEFAULT_HAIR_COLOR;
    const randomSkinColor =
      SKIN_COLOR_OPTIONS[
        Math.floor(Math.random() * SKIN_COLOR_OPTIONS.length)
      ]?.value ?? DEFAULT_SKIN_COLOR;
    const randomBrowColor =
      BROW_COLOR_OPTIONS[
        Math.floor(Math.random() * BROW_COLOR_OPTIONS.length)
      ]?.value ?? DEFAULT_BROW_COLOR;

    setSelected(nextSelection);
    setSkinColor(randomSkinColor);
    setHairColor(randomHairColor);
    setBrowColor(randomBrowColor);
    setFaceBox(createFullBox(catalog.canvas));
  }

  async function handleDownloadPng() {
    if (!catalog || isExporting) return;

    setIsExporting(true);

    try {
      const blob = await renderAvatarPngBlob({
        canvas: catalog.canvas,
        pose: poseItem,
        leftEar: leftEarItem,
        rightEar: rightEarItem,
        head: headItem,
        hair: hairItem,
        leftEye: leftEyeItem,
        rightEye: rightEyeItem,
        leftLash: leftLashItem,
        rightLash: rightLashItem,
        leftBrow: leftBrowItem,
        rightBrow: rightBrowItem,
        nose: noseItem,
        mouth: mouthItem,
        speechBubble: speechBubbleItem,
        speechBubbleBox,
        skinColor,
        hairColor,
        browColor,
        faceBox,
      });

      downloadBlob(blob, createDownloadFileName("png"));
    } catch (err) {
      console.error("Error exportando PNG:", err);
      window.alert("No se pudo descargar el PNG.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleSaveConfig() {
    if (!catalog) return;

    const config: AvatarConfigFile = {
      app: CONFIG_APP_ID,
      version: CONFIG_VERSION,
      savedAt: new Date().toISOString(),
      canvas: catalog.canvas,
      gender,
      selected,
      colors: {
        skin: skinColor,
        hair: hairColor,
        brow: browColor,
      },
      faceBox,
      speechBubble: {
        id: selectedSpeechBubbleId,
        box: speechBubbleBox,
      },
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, createDownloadFileName("json"));
  }

  function applyAvatarConfig(rawConfig: unknown) {
    if (!catalog) return;
    if (!isRecord(rawConfig)) {
      throw new Error("El JSON no contiene una configuracion valida");
    }

    const nextGender = isGender(rawConfig.gender)
      ? rawConfig.gender
      : DEFAULT_GENDER;
    const nextSelected = createSelectionFromConfig(
      rawConfig,
      catalog,
      nextGender
    );
    const rawColors = isRecord(rawConfig.colors) ? rawConfig.colors : {};
    const nextSkinColor = isHexColor(rawColors.skin)
      ? rawColors.skin
      : DEFAULT_SKIN_COLOR;
    const nextHairColor = isHexColor(rawColors.hair)
      ? rawColors.hair
      : DEFAULT_HAIR_COLOR;
    const nextBrowColor = isHexColor(rawColors.brow)
      ? rawColors.brow
      : DEFAULT_BROW_COLOR;
    const rawSpeechBubble = isRecord(rawConfig.speechBubble)
      ? rawConfig.speechBubble
      : {};
    const rawSpeechBubbleId = rawSpeechBubble.id;
    const nextSpeechBubbleId =
      typeof rawSpeechBubbleId === "string" &&
      catalog.speechBubbles.some((asset) => asset.id === rawSpeechBubbleId)
        ? rawSpeechBubbleId
        : EMPTY_SPEECH_BUBBLE_ID;
    const nextSpeechBubble = catalog.speechBubbles.find(
      (asset) => asset.id === nextSpeechBubbleId
    );
    const defaultSpeechBubbleBox = createDefaultSpeechBubbleBox(
      catalog.canvas,
      nextSpeechBubble
    );

    setGender(nextGender);
    setSelected(nextSelected);
    setSkinColor(nextSkinColor);
    setHairColor(nextHairColor);
    setBrowColor(nextBrowColor);
    setFaceBox(readBox(rawConfig.faceBox, createFullBox(catalog.canvas), catalog.canvas));
    setSelectedSpeechBubbleId(nextSpeechBubbleId);
    setSpeechBubbleBox(
      readBox(rawSpeechBubble.box, defaultSpeechBubbleBox, catalog.canvas)
    );
  }

  async function handleLoadConfigFile(file: File) {
    try {
      const text = await file.text();
      applyAvatarConfig(JSON.parse(text));
    } catch (err) {
      console.error("Error cargando JSON:", err);
      window.alert("No se pudo cargar el JSON.");
    }
  }

  return (
    <div style={pageStyles.wrapper}>
      <Header
        isReady={Boolean(catalog)}
        isExporting={isExporting}
        onDownloadPng={handleDownloadPng}
        onSaveConfig={handleSaveConfig}
        onLoadConfigFile={handleLoadConfigFile}
        onRandomize={handleRandomize}
        onReset={handleReset}
      />

      <main style={pageStyles.content}>
        <AssetSelectorPanel
          catalog={catalog}
          selected={selected}
          gender={gender}
          skinColor={skinColor}
          skinColorOptions={SKIN_COLOR_OPTIONS}
          hairColor={hairColor}
          hairColorOptions={HAIR_COLOR_OPTIONS}
          browColor={browColor}
          browColorOptions={BROW_COLOR_OPTIONS}
          onSelectionChange={handleSelectionChange}
          onGenderChange={handleGenderChange}
          onSkinColorChange={setSkinColor}
          onHairColorChange={setHairColor}
          onBrowColorChange={setBrowColor}
        />

        <AvatarPreview
          canvas={catalog?.canvas ?? DEFAULT_CANVAS}
          pose={poseItem}
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
          speechBubble={speechBubbleItem}
          speechBubbleBox={speechBubbleBox}
          skinColor={skinColor}
          hairColor={hairColor}
          browColor={browColor}
          faceBox={faceBox}
          onSpeechBubbleBoxChange={setSpeechBubbleBox}
        />

        <SpeechBubblePanel
          catalog={catalog}
          selectedId={selectedSpeechBubbleId}
          onSelect={handleSpeechBubbleSelect}
        />
      </main>
    </div>
  );
}
