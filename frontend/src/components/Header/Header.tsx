import { useRef, type ChangeEvent } from "react";
import { headerStyles } from "./Header.styles";

const LOGO_SRC = "/assets/Logo%20Asturcomic%20DEFINITIVO.svg";

type Props = {
  onDownloadPng: () => void;
  onSaveConfig: () => void;
  onLoadConfigFile: (file: File) => void;
  onRandomize: () => void;
  onReset: () => void;
  isReady: boolean;
  isExporting: boolean;
};

export function Header({
  onDownloadPng,
  onSaveConfig,
  onLoadConfigFile,
  onRandomize,
  onReset,
  isReady,
  isExporting,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const disabled = !isReady;
  const exportDisabled = disabled || isExporting;

  function handleLoadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onLoadConfigFile(file);
    }

    event.target.value = "";
  }

  return (
    <header style={headerStyles.wrapper}>
      <div style={headerStyles.titleBlock}>
        <img src={LOGO_SRC} alt="Asturcomic" style={headerStyles.logo} />
        <div style={headerStyles.copyBlock}>
          <h1 style={headerStyles.visuallyHidden}>Asturcomic</h1>
          <p style={headerStyles.subtitle}>
            Editor de personajes para docencia universitaria
          </p>
        </div>
      </div>

      <div style={headerStyles.actions}>
        <button
          type="button"
          style={{
            ...headerStyles.primaryButton,
            opacity: exportDisabled ? 0.55 : 1,
          }}
          onClick={onDownloadPng}
          disabled={exportDisabled}
        >
          <span className="pi pi-download" aria-hidden="true" />
          {isExporting ? "Preparando..." : "Descargar PNG"}
        </button>

        <button
          type="button"
          style={{
            ...headerStyles.secondaryButton,
            opacity: disabled ? 0.55 : 1,
          }}
          onClick={onSaveConfig}
          disabled={disabled}
        >
          <span className="pi pi-save" aria-hidden="true" />
          Guardar JSON
        </button>

        <button
          type="button"
          style={{
            ...headerStyles.secondaryButton,
            opacity: disabled ? 0.55 : 1,
          }}
          onClick={handleLoadClick}
          disabled={disabled}
        >
          <span className="pi pi-upload" aria-hidden="true" />
          Cargar JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          style={headerStyles.fileInput}
        />

        <button
          type="button"
          style={{
            ...headerStyles.secondaryButton,
            opacity: disabled ? 0.55 : 1,
          }}
          onClick={onReset}
          disabled={disabled}
        >
          <span className="pi pi-replay" aria-hidden="true" />
          Reiniciar
        </button>

        <button
          type="button"
          style={{
            ...headerStyles.secondaryButton,
            opacity: disabled ? 0.55 : 1,
          }}
          onClick={onRandomize}
          disabled={disabled}
        >
          <span className="pi pi-sparkles" aria-hidden="true" />
          Aleatorio
        </button>
      </div>
    </header>
  );
}
