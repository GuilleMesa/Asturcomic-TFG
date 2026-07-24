import type { Catalog, CompositeAsset } from "../../types/avatar";
import { speechBubbleStyles } from "./SpeechBubblePanel.styles";

type Props = {
  catalog: Catalog | null;
  selectedId: string;
  onSelect: (id: string) => void;
};

function SpeechBubbleTile({
  asset,
  isSelected,
  onSelect,
}: {
  asset: CompositeAsset;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const layer = asset.layers[0];

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      title={asset.label}
      onClick={() => onSelect(asset.id)}
      style={{
        ...speechBubbleStyles.tile,
        borderColor: isSelected ? "#0f766e" : "#e5e7eb",
        backgroundColor: isSelected ? "#ecfdf5" : "#ffffff",
        boxShadow: isSelected ? "0 0 0 2px rgba(15, 118, 110, 0.16)" : "none",
      }}
    >
      <span style={speechBubbleStyles.thumbnailFrame}>
        {layer ? (
          <img src={layer.src} alt="" style={speechBubbleStyles.thumbnail} />
        ) : (
          <span className="pi pi-ban" style={speechBubbleStyles.emptyIcon} />
        )}
      </span>

      <span style={speechBubbleStyles.tileLabel}>{asset.label}</span>
    </button>
  );
}

export function SpeechBubblePanel({ catalog, selectedId, onSelect }: Props) {
  if (!catalog) {
    return (
      <section style={speechBubbleStyles.wrapper}>
        <h2 style={speechBubbleStyles.title}>Bocadillos</h2>
        <div style={speechBubbleStyles.loadingBlock}>
          <span className="pi pi-spin pi-spinner" aria-hidden="true" />
          <span>Cargando bocadillos...</span>
        </div>
      </section>
    );
  }

  return (
    <section style={speechBubbleStyles.wrapper}>
      <div>
        <h2 style={speechBubbleStyles.title}>Bocadillos</h2>
        <p style={speechBubbleStyles.subtitle}>Un bocadillo</p>
      </div>

      <div style={speechBubbleStyles.tileGrid}>
        {catalog.speechBubbles.map((asset) => (
          <SpeechBubbleTile
            key={asset.id}
            asset={asset}
            isSelected={selectedId === asset.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
