import { Dropdown } from "primereact/dropdown";
import type {
  Catalog,
  SelectableCategory,
  SelectedAvatar,
} from "../../types/avatar";
import type { HairColorOption } from "../../constants/hairColors";
import { selectorStyles } from "./AssetSelectorPanel.styles";

type Props = {
  catalog: Catalog | null;
  selected: SelectedAvatar;
  hairColor: string;
  hairColorOptions: HairColorOption[];
  browColor: string;
  browColorOptions: HairColorOption[];
  onSelectionChange: (category: SelectableCategory, id: string) => void;
  onHairColorChange: (color: string) => void;
  onBrowColorChange: (color: string) => void;
};

const SELECTOR_CONFIG: Array<{
  category: SelectableCategory;
  label: string;
  placeholder: string;
}> = [
  {
    category: "heads",
    label: "Cabeza",
    placeholder: "Selecciona una cabeza",
  },
  {
    category: "leftEars",
    label: "Oreja izquierda",
    placeholder: "Selecciona una oreja izquierda",
  },
  {
    category: "rightEars",
    label: "Oreja derecha",
    placeholder: "Selecciona una oreja derecha",
  },
  {
    category: "hairs",
    label: "Pelo",
    placeholder: "Selecciona un pelo",
  },
  {
    category: "leftEyes",
    label: "Ojo izquierdo",
    placeholder: "Selecciona un ojo izquierdo",
  },
  {
    category: "rightEyes",
    label: "Ojo derecho",
    placeholder: "Selecciona un ojo derecho",
  },
  {
    category: "leftLashes",
    label: "Pestaña izquierda",
    placeholder: "Selecciona una pestaña izquierda",
  },
  {
    category: "rightLashes",
    label: "Pestaña derecha",
    placeholder: "Selecciona una pestaña derecha",
  },
  {
    category: "leftBrows",
    label: "Ceja izquierda",
    placeholder: "Selecciona una ceja izquierda",
  },
  {
    category: "rightBrows",
    label: "Ceja derecha",
    placeholder: "Selecciona una ceja derecha",
  },
  {
    category: "noses",
    label: "Nariz",
    placeholder: "Selecciona una nariz",
  },
  {
    category: "mouths",
    label: "Boca",
    placeholder: "Selecciona una boca",
  },
];

type ColorControlProps = {
  label: string;
  ariaLabel: string;
  color: string;
  options: HairColorOption[];
  onColorChange: (color: string) => void;
};

function ColorControl({
  label,
  ariaLabel,
  color,
  options,
  onColorChange,
}: ColorControlProps) {
  return (
    <div style={selectorStyles.colorGroup}>
      <span style={selectorStyles.subLabel}>{label}</span>
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
                  ? "0 0 0 2px #ffffff, 0 0 0 4px #2563eb"
                  : "none",
              }}
            />
          );
        })}

        <input
          aria-label={`${ariaLabel} personalizado`}
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={selectorStyles.colorInput}
        />
      </div>
    </div>
  );
}

export function AssetSelectorPanel({
  catalog,
  selected,
  hairColor,
  hairColorOptions,
  browColor,
  browColorOptions,
  onSelectionChange,
  onHairColorChange,
  onBrowColorChange,
}: Props) {
  if (!catalog) {
    return (
      <section style={selectorStyles.wrapper}>
        <h2 style={selectorStyles.title}>Selección de piezas</h2>
        <p>Cargando catálogo...</p>
      </section>
    );
  }

  return (
    <section style={selectorStyles.wrapper}>
      <h2 style={selectorStyles.title}>Selección de piezas</h2>

      {SELECTOR_CONFIG.map(({ category, label, placeholder }) => (
        <div key={category} style={selectorStyles.group}>
          <label style={selectorStyles.label}>{label}</label>
          <Dropdown
            value={selected[category]}
            options={catalog[category]}
            optionLabel="label"
            optionValue="id"
            onChange={(e) => onSelectionChange(category, e.value)}
            placeholder={placeholder}
          />

          {category === "hairs" && (
            <ColorControl
              label="Color del pelo"
              ariaLabel="Color del pelo"
              color={hairColor}
              options={hairColorOptions}
              onColorChange={onHairColorChange}
            />
          )}

          {category === "rightBrows" && (
            <ColorControl
              label="Color de cejas"
              ariaLabel="Color de cejas"
              color={browColor}
              options={browColorOptions}
              onColorChange={onBrowColorChange}
            />
          )}
        </div>
      ))}
    </section>
  );
}
