import { Dropdown } from "primereact/dropdown";
import type { Catalog, SelectedAvatar } from "../../types/avatar";
import { selectorStyles } from "./AssetSelectorPanel.styles";

type Props = {
  catalog: Catalog | null;
  selected: SelectedAvatar;
  onHeadChange: (id: string) => void;
  onEyesChange: (id: string) => void;
  onBrowsChange: (id: string) => void;
  onNosesChange: (id: string) => void;
  onMouthsChange: (id: string) => void;
};

export function AssetSelectorPanel({
  catalog,
  selected,
  onHeadChange,
  onEyesChange,
  onBrowsChange,
  onNosesChange,
  onMouthsChange,
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

      <div style={selectorStyles.group}>
        <label style={selectorStyles.label}>Cabeza</label>
        <Dropdown
          value={selected.heads}
          options={catalog.heads}
          optionLabel="id"
          optionValue="id"
          onChange={(e) => onHeadChange(e.value)}
          placeholder="Selecciona una cabeza"
        />
      </div>

      <div style={selectorStyles.group}>
        <label style={selectorStyles.label}>Ojos</label>
        <Dropdown
          value={selected.eyes}
          options={catalog.eyes}
          optionLabel="id"
          optionValue="id"
          onChange={(e) => onEyesChange(e.value)}
          placeholder="Selecciona unos ojos"
        />
      </div>

      <div style={selectorStyles.group}>
        <label style={selectorStyles.label}>Cejas</label>
        <Dropdown
          value={selected.brows}
          options={catalog.brows}
          optionLabel="id"
          optionValue="id"
          onChange={(e) => onBrowsChange(e.value)}
          placeholder="Selecciona unas cejas"
        />
      </div>

      <div style={selectorStyles.group}>
        <label style={selectorStyles.label}>Nariz</label>
        <Dropdown
          value={selected.noses}
          options={catalog.noses}
          optionLabel="id"
          optionValue="id"
          onChange={(e) => onNosesChange(e.value)}
          placeholder="Selecciona una nariz"
        />
      </div>

      <div style={selectorStyles.group}>
        <label style={selectorStyles.label}>Boca</label>
        <Dropdown
          value={selected.mouths}
          options={catalog.mouths}
          optionLabel="id"
          optionValue="id"
          onChange={(e) => onMouthsChange(e.value)}
          placeholder="Selecciona una boca"
        />
      </div>
    </section>
  );
}