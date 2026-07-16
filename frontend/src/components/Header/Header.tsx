import { headerStyles } from "./Header.styles";

const LOGO_SRC = "/assets/Logo%20Asturcomic%20DEFINITIVO.svg";

type Props = {
  onRandomize: () => void;
  onReset: () => void;
  isReady: boolean;
};

export function Header({ onRandomize, onReset, isReady }: Props) {
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
          style={headerStyles.secondaryButton}
          onClick={onReset}
          disabled={!isReady}
        >
          <span className="pi pi-replay" aria-hidden="true" />
          Reiniciar
        </button>

        <button
          type="button"
          style={{
            ...headerStyles.primaryButton,
            opacity: isReady ? 1 : 0.55,
          }}
          onClick={onRandomize}
          disabled={!isReady}
        >
          <span className="pi pi-sparkles" aria-hidden="true" />
          Aleatorio
        </button>
      </div>
    </header>
  );
}
