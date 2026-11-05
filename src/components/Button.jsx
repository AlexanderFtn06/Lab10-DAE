// TODO (Button) — escribe un botón reutilizable.
//
// Acepta una prop `variant` con los valores "primary", "danger" y "ghost"
// (por defecto "primary") y la refleja en la clase "btn btn-<variant>".
// Recibe su contenido por `children` (puede ser texto o elementos).
// Es type="button" por defecto, para que no envíe formularios sin querer.
// Pero quien lo use debe poder cambiarlo con type="submit".
// Reenvía el resto de props (onClick, disabled, aria-label...) al <button> real.
//
// Pon {...rest} DESPUÉS de type="button" para que el type por defecto se applique primero.
export default function Button({ variant = "primary", children, ...rest }) {
  return <button type="button" className={`btn btn-${variant}`} {...rest}>{children}</button>;
}
