import { headerStyles } from "./Header.styles";

export function Header() {
  return (
    <header style={headerStyles.wrapper}>
      <div style={headerStyles.titleBlock}>
        <h1 style={headerStyles.title}>Asturcómic</h1>
        <p style={headerStyles.subtitle}>
          Editor de personajes para docencia universitaria
        </p>
      </div>
    </header>
  );
}