/**
 * Flecha decorativa reutilizable para enlaces y acciones de OMNIX.
 * Combina un destello horizontal violeta con una punta metálica,
 * siguiendo el estilo visual de la identidad de la aplicación.
 */
export default function FlechaVioleta({ className = "" }) {
  return (
    <svg
      className={`omnix-neon-arrow ${className}`.trim()}
      viewBox="0 0 42 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Halo exterior: crea el brillo violeta alrededor de la flecha. */}
      <path d="M1 10H28M20 2L30 10L20 18" stroke="#8d27ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
      {/* Trazo interior claro que simula el acabado metálico de la referencia. */}
      <path d="M1 10H28M20 2L30 10L20 18" stroke="#eadbff" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      {/* Destello central sobre la línea horizontal. */}
      <path d="M2 10H18" stroke="#b95cff" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
