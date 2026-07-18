export function ProductVisual({ accent = "cyan", compact = false }: { accent?: "cyan" | "violet"; compact?: boolean }) {
  return (
    <div className={`product-visual product-visual-${accent} ${compact ? "product-visual-compact" : ""}`} aria-hidden="true">
      <div className="product-orbit" />
      <div className="product-drone">
        <i className="product-rotor pr-one" />
        <i className="product-rotor pr-two" />
        <i className="product-rotor pr-three" />
        <i className="product-rotor pr-four" />
        <span className="product-arm pa-one" />
        <span className="product-arm pa-two" />
        <b><em /></b>
      </div>
      <span className="product-visual-label">PRODUCT VISUAL / PLACEHOLDER</span>
    </div>
  );
}

