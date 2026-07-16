import { Slider } from "primereact/slider";
import type { Box, CanvasSize } from "../../types/avatar";
import { boxControlsStyles } from "./BoxControlsPanel.styles";

type Props = {
  canvas: CanvasSize;
  faceBox: Box;
  setFaceBox: (box: Box) => void;
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
      <h3 style={boxControlsStyles.blockTitle}>{title}</h3>

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

export function BoxControlsPanel({ canvas, faceBox, setFaceBox }: Props) {
  return (
    <section style={boxControlsStyles.wrapper}>
      <div>
        <h2 style={boxControlsStyles.title}>Ajustes</h2>
        <p style={boxControlsStyles.subtitle}>Lienzo de trabajo</p>
      </div>

      <BoxEditor
        title="Cara completa"
        value={faceBox}
        onChange={setFaceBox}
        maxW={canvas.w}
        maxH={canvas.h}
        minW={300}
        minH={300}
      />
    </section>
  );
}
