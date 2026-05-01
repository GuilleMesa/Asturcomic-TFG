import { Slider } from "primereact/slider";
import type {
  AdjustableBoxes,
  AdjustableKey,
  Box,
} from "../../types/avatar";
import { boxControlsStyles } from "./BoxControlsPanel.styles";

type Props = {
  faceBox: Box;
  setFaceBox: (box: Box) => void;
  boxes: AdjustableBoxes;
  setBox: (category: AdjustableKey, box: Box) => void;
};

function BoxEditor({
  title,
  value,
  onChange,
  maxW,
  maxH,
  minW = 50,
  minH = 50,
}: {
  title: string;
  value: Box;
  onChange: (next: Box) => void;
  maxW: number;
  maxH: number;
  minW?: number;
  minH?: number;
}) {
  return (
    <div style={boxControlsStyles.block}>
      <h3>{title}</h3>

      <div style={boxControlsStyles.field}>
        <label style={boxControlsStyles.label}>
          X <span style={boxControlsStyles.value}>{value.x}</span>
        </label>
        <Slider
          value={value.x}
          min={0}
          max={maxW}
          onChange={(e) => onChange({ ...value, x: Number(e.value) })}
        />
      </div>

      <div style={boxControlsStyles.field}>
        <label style={boxControlsStyles.label}>
          Y <span style={boxControlsStyles.value}>{value.y}</span>
        </label>
        <Slider
          value={value.y}
          min={0}
          max={maxH}
          onChange={(e) => onChange({ ...value, y: Number(e.value) })}
        />
      </div>

      <div style={boxControlsStyles.field}>
        <label style={boxControlsStyles.label}>
          W <span style={boxControlsStyles.value}>{value.w}</span>
        </label>
        <Slider
          value={value.w}
          min={minW}
          max={maxW}
          onChange={(e) => onChange({ ...value, w: Number(e.value) })}
        />
      </div>

      <div>
        <label style={boxControlsStyles.label}>
          H <span style={boxControlsStyles.value}>{value.h}</span>
        </label>
        <Slider
          value={value.h}
          min={minH}
          max={maxH}
          onChange={(e) => onChange({ ...value, h: Number(e.value) })}
        />
      </div>
    </div>
  );
}

export function BoxControlsPanel({
  faceBox,
  setFaceBox,
  boxes,
  setBox,
}: Props) {
  return (
    <section style={boxControlsStyles.wrapper}>
      <h2 style={boxControlsStyles.title}>Ajuste de posición</h2>

      <BoxEditor
        title="Cara completa"
        value={faceBox}
        onChange={setFaceBox}
        maxW={1855}
        maxH={1780}
        minW={300}
        minH={300}
      />

      <BoxEditor
        title="Ojos"
        value={boxes.eyes}
        onChange={(next) => setBox("eyes", next)}
        maxW={1855}
        maxH={1780}
      />

      <BoxEditor
        title="Cejas"
        value={boxes.brows}
        onChange={(next) => setBox("brows", next)}
        maxW={1855}
        maxH={1780}
      />

      <BoxEditor
        title="Nariz"
        value={boxes.noses}
        onChange={(next) => setBox("noses", next)}
        maxW={1855}
        maxH={1780}
      />

      <BoxEditor
        title="Boca"
        value={boxes.mouths}
        onChange={(next) => setBox("mouths", next)}
        maxW={1855}
        maxH={1780}
      />
    </section>
  );
}