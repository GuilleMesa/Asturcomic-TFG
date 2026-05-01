import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header/Header";
import { AvatarPreview } from "../../components/AvatarPreview/AvatarPreview";
import { AssetSelectorPanel } from "../../components/AssetSelectorPanel/AssetSelectorPanel";
import { BoxControlsPanel } from "../../components/BoxControlsPanel/BoxControlsPanel";
import { fetchCatalog } from "../../services/catalogService";
import type {
  AdjustableBoxes,
  AdjustableKey,
  Box,
  Catalog,
  SelectedAvatar,
} from "../../types/avatar";
import { pageStyles } from "./AvatarEditorPage.styles";

const DEFAULT_FULL_BOX: Box = { x: 0, y: 0, w: 1855, h: 1780 };
const DEFAULT_BROW_BOX: Box = { x: 490, y: 520, w: 940, h: 200 };
const DEFAULT_NOSE_BOX: Box = { x: 850, y: 880, w: 180, h: 180 };
const DEFAULT_MOUTH_BOX: Box = { x: 760, y: 1120, w: 320, h: 140 };

const DEFAULT_BOXES: AdjustableBoxes = {
  eyes: DEFAULT_FULL_BOX,
  brows: DEFAULT_BROW_BOX,
  noses: DEFAULT_NOSE_BOX,
  mouths: DEFAULT_MOUTH_BOX,
};

function getItemBox(
  catalog: Catalog | null,
  category: AdjustableKey,
  id: string
): Box {
  if (!catalog) return DEFAULT_BOXES[category];

  const item = catalog[category].find((asset) => asset.id === id);
  return item?.box ?? DEFAULT_BOXES[category];
}

export function AvatarEditorPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  const [selected, setSelected] = useState<SelectedAvatar>({
    heads: "",
    eyes: "",
    brows: "",
    noses: "",
    mouths: "",
  });

  const [faceBox, setFaceBox] = useState<Box>(DEFAULT_FULL_BOX);
  const [boxes, setBoxes] = useState<AdjustableBoxes>(DEFAULT_BOXES);

  useEffect(() => {
    fetchCatalog()
      .then((data) => {
        setCatalog(data);

        const head0 = data.heads[0];
        const eye0 = data.eyes[0];
        const brow0 = data.brows[0];
        const nose0 = data.noses[0];
        const mouth0 = data.mouths[0];

        setSelected({
          heads: head0?.id ?? "",
          eyes: eye0?.id ?? "",
          brows: brow0?.id ?? "",
          noses: nose0?.id ?? "",
          mouths: mouth0?.id ?? "",
        });

        setFaceBox(DEFAULT_FULL_BOX);

        setBoxes({
          eyes: eye0?.box ?? DEFAULT_FULL_BOX,
          brows: brow0?.box ?? DEFAULT_BROW_BOX,
          noses: nose0?.box ?? DEFAULT_NOSE_BOX,
          mouths: mouth0?.box ?? DEFAULT_MOUTH_BOX,
        });
      })
      .catch((err) => {
        console.error("Error cargando catálogo:", err);
      });
  }, []);

  const headItem = useMemo(
    () => catalog?.heads.find((item) => item.id === selected.heads),
    [catalog, selected.heads]
  );

  const eyesItem = useMemo(
    () => catalog?.eyes.find((item) => item.id === selected.eyes),
    [catalog, selected.eyes]
  );

  const browsItem = useMemo(
    () => catalog?.brows.find((item) => item.id === selected.brows),
    [catalog, selected.brows]
  );

  const nosesItem = useMemo(
    () => catalog?.noses.find((item) => item.id === selected.noses),
    [catalog, selected.noses]
  );

  const mouthsItem = useMemo(
    () => catalog?.mouths.find((item) => item.id === selected.mouths),
    [catalog, selected.mouths]
  );

  function handleHeadChange(id: string) {
    setSelected((prev) => ({ ...prev, heads: id }));
  }

  function handleAdjustableChange(category: AdjustableKey, id: string) {
    setSelected((prev) => ({
      ...prev,
      [category]: id,
    }));

    setBoxes((prev) => ({
      ...prev,
      [category]: getItemBox(catalog, category, id),
    }));
  }

  function handleSetBox(category: AdjustableKey, box: Box) {
    setBoxes((prev) => ({
      ...prev,
      [category]: box,
    }));
  }

  return (
    <div style={pageStyles.wrapper}>
      <Header />

      <main style={pageStyles.content}>
        <AssetSelectorPanel
          catalog={catalog}
          selected={selected}
          onHeadChange={handleHeadChange}
          onEyesChange={(id) => handleAdjustableChange("eyes", id)}
          onBrowsChange={(id) => handleAdjustableChange("brows", id)}
          onNosesChange={(id) => handleAdjustableChange("noses", id)}
          onMouthsChange={(id) => handleAdjustableChange("mouths", id)}
        />

        <AvatarPreview
          head={headItem}
          eyes={eyesItem}
          brows={browsItem}
          noses={nosesItem}
          mouths={mouthsItem}
          faceBox={faceBox}
          boxes={boxes}
        />

        <BoxControlsPanel
          faceBox={faceBox}
          setFaceBox={setFaceBox}
          boxes={boxes}
          setBox={handleSetBox}
        />
      </main>
    </div>
  );
}