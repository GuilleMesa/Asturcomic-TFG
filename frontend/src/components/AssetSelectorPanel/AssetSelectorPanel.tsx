import { useMemo, useState, type CSSProperties } from "react";
import type { HairColorOption } from "../../constants/hairColors";
import type {
  CanvasSize,
  Catalog,
  CompositeAsset,
  Gender,
  SelectableCategory,
  SelectedAvatar,
} from "../../types/avatar";
import { selectorStyles } from "./AssetSelectorPanel.styles";

type Props = {
  catalog: Catalog | null;
  selected: SelectedAvatar;
  gender: Gender;
  skinColor: string;
  skinColorOptions: HairColorOption[];
  hairColor: string;
  hairColorOptions: HairColorOption[];
  browColor: string;
  browColorOptions: HairColorOption[];
  onSelectionChange: (category: SelectableCategory, id: string) => void;
  onGenderChange: (gender: Gender) => void;
  onSkinColorChange: (color: string) => void;
  onHairColorChange: (color: string) => void;
  onBrowColorChange: (color: string) => void;
};

type SelectorPart = {
  category: SelectableCategory;
  label: string;
};

type EditorSection = {
  id: string;
  label: string;
  icon: string;
  parts: SelectorPart[];
  genderControl?: boolean;
  colorControl?: "skin" | "hair" | "brows";
};

type GenderOption = {
  id: Gender;
  label: string;
  icon: string;
};

const GENDER_OPTIONS: GenderOption[] = [
  { id: "male", label: "Hombre", icon: "pi pi-user" },
  { id: "female", label: "Mujer", icon: "pi pi-user" },
  { id: "nonBinary", label: "No binario", icon: "pi pi-users" },
];

const SECTION_CONFIG: EditorSection[] = [
  {
    id: "body",
    label: "Cuerpo",
    icon: "pi pi-id-card",
    parts: [{ category: "poses", label: "Pose" }],
    genderControl: true,
  },
  {
    id: "base",
    label: "Base",
    icon: "pi pi-user",
    parts: [
      { category: "heads", label: "Cabeza" },
      { category: "leftEars", label: "Oreja izquierda" },
      { category: "rightEars", label: "Oreja derecha" },
    ],
    colorControl: "skin",
  },
  {
    id: "hair",
    label: "Pelo",
    icon: "pi pi-palette",
    parts: [{ category: "hairs", label: "Peinado" }],
    colorControl: "hair",
  },
  {
    id: "eyes",
    label: "Ojos",
    icon: "pi pi-eye",
    parts: [
      { category: "leftEyes", label: "Ojo izquierdo" },
      { category: "rightEyes", label: "Ojo derecho" },
      { category: "leftLashes", label: "Pestaña izquierda" },
      { category: "rightLashes", label: "Pestaña derecha" },
    ],
  },
  {
    id: "brows",
    label: "Cejas",
    icon: "pi pi-minus",
    parts: [
      { category: "leftBrows", label: "Ceja izquierda" },
      { category: "rightBrows", label: "Ceja derecha" },
    ],
    colorControl: "brows",
  },
  {
    id: "face",
    label: "Rostro",
    icon: "pi pi-circle",
    parts: [
      { category: "noses", label: "Nariz" },
      { category: "mouths", label: "Boca" },
    ],
  },
];

type ColorControlProps = {
  label: string;
  ariaLabel: string;
  color: string;
  options: HairColorOption[];
  onColorChange: (color: string) => void;
};

function getLayerPlacementStyle(
  asset: CompositeAsset,
  canvas: CanvasSize
): CSSProperties {
  const layerCanvas = asset.canvas ?? canvas;
  const offset = asset.offset ?? { x: 0, y: 0 };

  return {
    left: `${(offset.x / canvas.w) * 100}%`,
    top: `${(offset.y / canvas.h) * 100}%`,
    width: `${(layerCanvas.w / canvas.w) * 100}%`,
    height: `${(layerCanvas.h / canvas.h) * 100}%`,
  };
}

function getMaskStyle(
  asset: CompositeAsset,
  src: string,
  color: string,
  canvas: CanvasSize
): CSSProperties {
  const maskUrl = `url("${src}")`;

  return {
    ...selectorStyles.thumbnailLayer,
    ...getLayerPlacementStyle(asset, canvas),
    backgroundColor: color,
    maskImage: maskUrl,
    maskPosition: "center",
    maskRepeat: "no-repeat",
    maskSize: "100% 100%",
    WebkitMaskImage: maskUrl,
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%",
  };
}

function ColorControl({
  label,
  ariaLabel,
  color,
  options,
  onColorChange,
}: ColorControlProps) {
  return (
    <div style={selectorStyles.colorPanel}>
      <div style={selectorStyles.colorHeader}>
        <span style={selectorStyles.subLabel}>{label}</span>
        <input
          aria-label={`${ariaLabel} personalizado`}
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={selectorStyles.colorInput}
        />
      </div>

      <div style={selectorStyles.swatches}>
        {options.map((option) => {
          const isSelected = option.value.toLowerCase() === color.toLowerCase();

          return (
            <button
              key={option.id}
              type="button"
              title={option.label}
              aria-label={`${ariaLabel}: ${option.label}`}
              onClick={() => onColorChange(option.value)}
              style={{
                ...selectorStyles.swatch,
                backgroundColor: option.value,
                borderColor: isSelected ? "#111827" : "#d1d5db",
                boxShadow: isSelected
                  ? "0 0 0 2px #ffffff, 0 0 0 4px #0f766e"
                  : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function GenderControl({
  gender,
  onGenderChange,
}: {
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
}) {
  return (
    <div style={selectorStyles.genderPanel}>
      <span style={selectorStyles.subLabel}>Género base</span>
      <div style={selectorStyles.segmentedControl}>
        {GENDER_OPTIONS.map((option) => {
          const isSelected = option.id === gender;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onGenderChange(option.id)}
              style={{
                ...selectorStyles.segmentedButton,
                backgroundColor: isSelected ? "#0f766e" : "transparent",
                color: isSelected ? "#ffffff" : "#334155",
              }}
            >
              <span className={option.icon} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function renderThumbnailLayer(
  asset: CompositeAsset,
  layer: CompositeAsset["layers"][number],
  canvas: CanvasSize,
  color?: string
) {
  if (layer.colorable && color) {
    const colorMode = layer.colorMode ?? "fill";
    const maskSrc = layer.maskSrc ?? layer.src;

    if (colorMode === "tint") {
      return (
        <div
          key={layer.id}
          aria-hidden="true"
          style={getMaskStyle(asset, maskSrc, color, canvas)}
        />
      );
    }

    return (
      <div key={layer.id}>
        <div
          aria-hidden="true"
          style={getMaskStyle(asset, maskSrc, color, canvas)}
        />
        <img
          src={layer.src}
          alt=""
          style={{
            ...selectorStyles.thumbnailLayer,
            ...getLayerPlacementStyle(asset, canvas),
            mixBlendMode: "multiply",
          }}
        />
      </div>
    );
  }

  return (
    <img
      key={layer.id}
      src={layer.src}
      alt=""
      style={{
        ...selectorStyles.thumbnailLayer,
        ...getLayerPlacementStyle(asset, canvas),
        mixBlendMode: layer.blendMode,
      }}
    />
  );
}

function filterAssetsByGender(
  assets: CompositeAsset[],
  category: SelectableCategory,
  gender: Gender
): CompositeAsset[] {
  if (category !== "poses" || gender === "nonBinary") {
    return assets;
  }

  return assets.filter((asset) => asset.gender === gender);
}

function AssetTile({
  asset,
  category,
  canvas,
  color,
  isSelected,
  onSelectionChange,
}: {
  asset: CompositeAsset;
  category: SelectableCategory;
  canvas: CanvasSize;
  color?: string;
  isSelected: boolean;
  onSelectionChange: (category: SelectableCategory, id: string) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      title={asset.label}
      onClick={() => onSelectionChange(category, asset.id)}
      style={{
        ...selectorStyles.tile,
        borderColor: isSelected ? "#0f766e" : "#e5e7eb",
        backgroundColor: isSelected ? "#ecfdf5" : "#ffffff",
        boxShadow: isSelected ? "0 0 0 2px rgba(15, 118, 110, 0.16)" : "none",
      }}
    >
      <span
        style={{
          ...selectorStyles.thumbnailFrame,
          aspectRatio: category === "poses" ? "3 / 4" : "1 / 1",
        }}
      >
        <span style={selectorStyles.thumbnailStage}>
          {asset.layers.length === 0 ? (
            <span className="pi pi-ban" style={selectorStyles.emptyIcon} />
          ) : (
            asset.layers.map((layer) =>
              renderThumbnailLayer(asset, layer, canvas, color)
            )
          )}
        </span>
      </span>

      <span style={selectorStyles.tileLabel}>{asset.label}</span>
    </button>
  );
}

export function AssetSelectorPanel({
  catalog,
  selected,
  gender,
  skinColor,
  skinColorOptions,
  hairColor,
  hairColorOptions,
  browColor,
  browColorOptions,
  onSelectionChange,
  onGenderChange,
  onSkinColorChange,
  onHairColorChange,
  onBrowColorChange,
}: Props) {
  const [activeSectionId, setActiveSectionId] = useState(SECTION_CONFIG[0].id);
  const activeSection = useMemo(
    () =>
      SECTION_CONFIG.find((section) => section.id === activeSectionId) ??
      SECTION_CONFIG[0],
    [activeSectionId]
  );

  if (!catalog) {
    return (
      <section style={selectorStyles.wrapper}>
        <h2 style={selectorStyles.title}>Piezas</h2>
        <div style={selectorStyles.loadingBlock}>
          <span className="pi pi-spin pi-spinner" aria-hidden="true" />
          <span>Cargando catálogo...</span>
        </div>
      </section>
    );
  }

  function getColorForCategory(category: SelectableCategory) {
    if (
      category === "heads" ||
      category === "leftEars" ||
      category === "rightEars"
    ) {
      return skinColor;
    }
    if (category === "hairs") return hairColor;
    if (category === "leftBrows" || category === "rightBrows") {
      return browColor;
    }

    return undefined;
  }

  return (
    <section style={selectorStyles.wrapper}>
      <div style={selectorStyles.header}>
        <div>
          <h2 style={selectorStyles.title}>Piezas</h2>
          <p style={selectorStyles.subtitle}>Elige por categoría</p>
        </div>
      </div>

      <div style={selectorStyles.tabs} aria-label="Categorías de edición">
        {SECTION_CONFIG.map((section) => {
          const isActive = section.id === activeSection.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSectionId(section.id)}
              style={{
                ...selectorStyles.tab,
                backgroundColor: isActive ? "#0f766e" : "#ffffff",
                color: isActive ? "#ffffff" : "#334155",
                borderColor: isActive ? "#0f766e" : "#dbe2ea",
              }}
            >
              <span className={section.icon} aria-hidden="true" />
              {section.label}
            </button>
          );
        })}
      </div>

      <div style={selectorStyles.panel}>
        <div style={selectorStyles.panelHeader}>
          <h3 style={selectorStyles.panelTitle}>{activeSection.label}</h3>
          <span style={selectorStyles.panelMeta}>
            {activeSection.parts.length} bloque
            {activeSection.parts.length === 1 ? "" : "s"}
          </span>
        </div>

        {activeSection.genderControl && (
          <GenderControl gender={gender} onGenderChange={onGenderChange} />
        )}

        {activeSection.parts.map((part) => {
          const assets = filterAssetsByGender(
            catalog[part.category],
            part.category,
            gender
          );

          return (
            <div key={part.category} style={selectorStyles.partBlock}>
              <div style={selectorStyles.partHeader}>
                <span style={selectorStyles.partLabel}>{part.label}</span>
                <span style={selectorStyles.partCount}>{assets.length}</span>
              </div>

              <div style={selectorStyles.tileGrid}>
                {assets.map((asset) => (
                  <AssetTile
                    key={asset.id}
                    asset={asset}
                    category={part.category}
                    canvas={catalog.canvas}
                    color={getColorForCategory(part.category)}
                    isSelected={selected[part.category] === asset.id}
                    onSelectionChange={onSelectionChange}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {activeSection.colorControl === "skin" && (
          <ColorControl
            label="Color de piel"
            ariaLabel="Color de piel"
            color={skinColor}
            options={skinColorOptions}
            onColorChange={onSkinColorChange}
          />
        )}

        {activeSection.colorControl === "hair" && (
          <ColorControl
            label="Color del pelo"
            ariaLabel="Color del pelo"
            color={hairColor}
            options={hairColorOptions}
            onColorChange={onHairColorChange}
          />
        )}

        {activeSection.colorControl === "brows" && (
          <ColorControl
            label="Color de cejas"
            ariaLabel="Color de cejas"
            color={browColor}
            options={browColorOptions}
            onColorChange={onBrowColorChange}
          />
        )}
      </div>
    </section>
  );
}
