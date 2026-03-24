// Esta clase es el componente principal, aquí está la logica MVP
import { useEffect, useMemo, useState } from "react";

type Box = { x: number; y: number; w: number; h: number };

type Item = {
  id: string;
  label: string;
  src: string;
  default?: Box; // para cejas/narices (recortadas)
};

type Catalog = {
  canvas: { w: number; h: number };
  heads: Item[];
  eyes: Item[];
  brows: Item[];
  noses: Item[];
};

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string>("");

  // Selecciones
  const [headId, setHeadId] = useState("");
  const [eyesId, setEyesId] = useState("");
  const [browId, setBrowId] = useState("");
  const [noseId, setNoseId] = useState("");

  // Cajas editables (calibración) para cejas/nariz
  const [browBox, setBrowBox] = useState<Box>({ x: 0, y: 0, w: 100, h: 100 });
  const [noseBox, setNoseBox] = useState<Box>({ x: 0, y: 0, w: 100, h: 100 });

  // Tamaño del lienzo en pantalla (px)
  const [canvasPx, setCanvasPx] = useState(560);

  // Cargar catálogo al iniciar
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Catalog) => {
        setCatalog(data);

        const h0 = data.heads?.[0];
        const e0 = data.eyes?.[0];
        const b0 = data.brows?.[0];
        const n0 = data.noses?.[0];

        // Selecciones por defecto (primer elemento de cada lista)
        setHeadId(h0.id ?? "");
        setEyesId(e0.id ?? "");
        setBrowId(b0.id ?? "");
        setNoseId(n0.id ?? "");

        if (b0?.default) setBrowBox(b0.default);
        if (n0?.default) setNoseBox(n0.default);
      })
      .catch((e) => setError(String(e)));
  }, []);

  // Helpers para encontrar el item seleccionado
  const selectedHead = useMemo(
    () => catalog?.heads.find((x) => x.id === headId),
    [catalog, headId]
  );
  const selectedEyes = useMemo(
    () => catalog?.eyes.find((x) => x.id === eyesId),
    [catalog, eyesId]
  );
  const selectedBrow = useMemo(
    () => catalog?.brows.find((x) => x.id === browId),
    [catalog, browId]
  );
  const selectedNose = useMemo(
    () => catalog?.noses.find((x) => x.id === noseId),
    [catalog, noseId]
  );

  if (error) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: 16 }}>
        <h2>Error cargando catálogo</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: 16 }}>
        Cargando catálogo...
      </div>
    );
  }

  const BASE_W = catalog.canvas.w;
  const BASE_H = catalog.canvas.h;
  const scale = canvasPx / BASE_W;
  const canvasHeightPx = BASE_H * scale;

  const layerFull: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  };

  const placedStyle = (b: Box): React.CSSProperties => ({
    position: "absolute",
    left: b.x * scale,
    top: b.y * scale,
    width: b.w * scale,
    height: b.h * scale,
    pointerEvents: "none",
  });

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: 16,
        display: "grid",
        gap: 16,
      }}
    >
      <h1>Asturcómic — Builder (MVP)</h1>

      {/* Selector básico */}
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label>
          Tamaño preview (px): <b>{canvasPx}</b>
          <input
            type="range"
            min={300}
            max={900}
            value={canvasPx}
            onChange={(e) => setCanvasPx(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Cabeza:
          <select
            value={headId}
            onChange={(e) => setHeadId(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            {catalog.heads.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ojos:
          <select
            value={eyesId}
            onChange={(e) => setEyesId(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            {catalog.eyes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ceja:
          <select
            value={browId}
            onChange={(e) => {
              const id = e.target.value;
              setBrowId(id);

              const item = catalog.brows.find((b) => b.id === id);
              if (item?.default) setBrowBox(item.default);
            }}
          >
            {catalog.brows.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Nariz:
          <select
            value={noseId}
            onChange={(e) => {
              const id = e.target.value;
              setNoseId(id);

              const item = catalog.noses.find((n) => n.id === id);
              if (item?.default) setNoseBox(item.default);
            }}
          >
            {catalog.noses.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Preview */}
      <div
        style={{
          width: canvasPx,
          height: canvasHeightPx,
          position: "relative",
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "#f6f6f6",
          overflow: "hidden",
        }}
      >
        {selectedHead && <img src={selectedHead.src} alt="head" style={layerFull} />}
        {selectedEyes && <img src={selectedEyes.src} alt="eyes" style={layerFull} />}

        {/* ceja y nariz son recortadas -> se colocan con x,y,w,h */}
        {selectedBrow && <img src={selectedBrow.src} alt="brow" style={placedStyle(browBox)} />}
        {selectedNose && <img src={selectedNose.src} alt="nose" style={placedStyle(noseBox)} />}
      </div>

      {/* Calibrador (para Opción B) */}
      <div style={{ display: "grid", gap: 18, maxWidth: 700 }}>
        <h2>Calibración (x, y, w, h)</h2>

        <div style={{ display: "grid", gap: 8, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
          <h3 style={{ margin: 0 }}>Ceja: {selectedBrow?.id}</h3>
          <Range label="x" min={0} max={BASE_W} value={browBox.x} onChange={(v) => setBrowBox({ ...browBox, x: v })} />
          <Range label="y" min={0} max={BASE_H} value={browBox.y} onChange={(v) => setBrowBox({ ...browBox, y: v })} />
          <Range label="w" min={10} max={BASE_W} value={browBox.w} onChange={(v) => setBrowBox({ ...browBox, w: v })} />
          <Range label="h" min={10} max={BASE_H} value={browBox.h} onChange={(v) => setBrowBox({ ...browBox, h: v })} />
          <CopyJsonButton obj={browBox} />
        </div>

        <div style={{ display: "grid", gap: 8, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
          <h3 style={{ margin: 0 }}>Nariz: {selectedNose?.id}</h3>
          <Range label="x" min={0} max={BASE_W} value={noseBox.x} onChange={(v) => setNoseBox({ ...noseBox, x: v })} />
          <Range label="y" min={0} max={BASE_H} value={noseBox.y} onChange={(v) => setNoseBox({ ...noseBox, y: v })} />
          <Range label="w" min={10} max={BASE_W} value={noseBox.w} onChange={(v) => setNoseBox({ ...noseBox, w: v })} />
          <Range label="h" min={10} max={BASE_H} value={noseBox.h} onChange={(v) => setNoseBox({ ...noseBox, h: v })} />
          <CopyJsonButton obj={noseBox} />
        </div>

        <p style={{ color: "#555" }}>
          Copia el JSON y pégalo como <code>default</code> en el item correspondiente dentro de <code>catalog.json</code>.
        </p>
      </div>
    </div>
  );
}

function Range(props: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      {props.label}: <b>{Math.round(props.value)}</b>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

function CopyJsonButton({ obj }: { obj: Box }) {
  return (
    <button
      onClick={() => {
        const txt = JSON.stringify(obj, null, 2);
        navigator.clipboard.writeText(txt);
        alert("Copiado al portapapeles:\n" + txt);
      }}
      style={{ width: "fit-content", padding: "6px 10px" }}
    >
      Copiar JSON
    </button>
  );
}
