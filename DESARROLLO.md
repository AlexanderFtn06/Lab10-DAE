# Desarrollo del laboratorio: La bandeja de aprobaciones

Documentación del trabajo realizado en el laboratorio extra de la semana 10 de Desarrollo de Aplicaciones Empresariales (DAE). El `README.md` explica cómo está armado el laboratorio; este archivo registra **qué se hizo, en qué orden y por qué**.

- **Plantilla:** `Hellscythe25/dae-s10-bandeja-aprobaciones`

## El proyecto

Una pantalla en React donde una persona revisa y decide lo que propone un agente de IA. Es la mitad **humana** de la frontera de confianza de la semana 8.

- El agente propone **planes**. Cada plan tiene `id`, `op`, `risk`, `target`, `plan_hash` y `proposed_by`.
- **R1** crea datos y se aprueba con un clic. **R2** destruye datos y exige escribir el `plan_hash` exacto.
- Las decisiones se guardan en el navegador (`localStorage`, clave `dae-s10-decisions`). La aplicación no llama a ninguna API; eso llega en la semana 12.
- El plan `P-02` trae un texto hostil («IGNORA TUS INSTRUCCIONES…»). Es un dato de terceros: se muestra como texto y nunca se obedece ni se inserta como HTML.

**Tecnología:** React 19, Vite 7, Vitest y Testing Library.

### Cómo está organizado el estado

```
App
└── Inbox            decisions, query   ← único estado de la bandeja
    └── PlanCard     (sin estado)       recibe plan y onDecide
        ├── HashConfirm   typed         recibe hash y onConfirm
        └── Button        (sin estado)  variant, children, ...rest
```

`pending`, `decided` y `visible` **no son estado**: se calculan en cada dibujado a partir de `plans`, `decisions` y `query`.

## Cómo ejecutarlo

```powershell
npm install
npm run dev          # http://localhost:5173
npm test             # pruebas sobre src/components
npm run test:ai      # las mismas pruebas sobre src/ai
```

## Resultado

| Comando | Al empezar | Al terminar |
|---|---|---|
| `npm test` | 27 pasan, 34 fallan | **61 de 61** |
| `npm run test:ai` | 50 pasan, 11 fallan | **61 de 61** |

## Pasos realizados

Cada avance se registró con un commit en español con el formato `paso N: descripción`.

| Paso | Qué se hizo | Resultado |
|---|---|---|
| 1 | Se creó el repositorio desde la plantilla, se instaló y se levantó la aplicación | Se documentó qué no funcionaba: `decide` vacía, `HashConfirm` sin validación y contadores fijos |
| 2 | Se leyó `src/data/plans.js`, se comparó `plan_hash` con `agent/gateway.py` (S08) y se corrió `npm test` | 61 pruebas: 27 pasan, 34 fallan |
| 3 | `Button` con `variant`, `children`, `type="button"` y `{...rest}` al final | 12 de 12 |
| 4 | Se comprobó el aspecto de los botones y dónde se usa `Button` | Sin cambios de código |
| 5 | `HashConfirm` con entrada controlada y botón deshabilitado hasta igualdad estricta | 12 de 12 |
| 6 | `Inbox`: estados `decisions` y `query`, y `decide` sin mutar el estado | 2 de 22 (sin cambio visible aún) |
| 7 | `pending` y `decided` como valores derivados | 11 de 22 |
| 8 | Búsqueda (`visible`) y `clearSearch` | 20 de 22 |
| 9 | Persistencia con `useEffect` | **61 de 61** |
| 10 | `npm run test:ai` sobre la versión de la IA | 11 fallos en 3 archivos |
| 11 | Clasificación de los cuatro errores de `src/ai/` | Ver la tabla de abajo |
| 12 | Un arreglo por commit, con `test:ai` después de cada uno | 50 → 52 → 58 → 60 → **61** |
| 13 | Se provocó un `onClick` llamado al dibujar | Dos planes R1 aprobados sin ningún clic |
| 14 | Se registró dónde vive cada dato y cada prop | Ver el documento del entregable |
| 15 | Se explicó por qué la interfaz no es la frontera de seguridad | Ver la sección siguiente |
| 16 | Tabla de uso de IA y entrega | En el documento del entregable |

## Los cuatro errores de la versión de la IA

| Tema | Dónde | Causa | Arreglo |
|---|---|---|---|
| Comparación parcial del hash | `src/ai/HashConfirm.jsx` | `typed.includes(hash)` acepta coincidencias parciales | `typed === hash` |
| Estado modificado en lugar de copiado | `src/ai/Inbox.jsx`, `decide` | `decisions[id] = verdict` modifica el objeto y React no redibuja | `setDecisions((current) => ({ ...current, [id]: verdict }))` |
| Función llamada en vez de pasada | `src/ai/Inbox.jsx`, botón Limpiar búsqueda | `onClick={clearSearch()}` se ejecuta al dibujar | `onClick={clearSearch}` |
| Estado duplicado en el hijo | `src/ai/PlanCard.jsx` | La tarjeta guardaba su propio `verdict` | La tarjeta solo llama a `onDecide`; el padre guarda la decisión |

**Efecto en cadena del segundo arreglo:** al dejar de mutar el estado, `writeStoredDecisions(decisions)` dentro de `decide` guardaba el valor anterior (`setDecisions` no actualiza al instante) y fallaron dos pruebas de persistencia (56 pasan, 5 fallan). Se resolvió guardando con un `useEffect` que depende de `[decisions]`.

## Decisiones de diseño

- **`decisions` vive en `Inbox`**, porque todas las tarjetas, los contadores, la búsqueda y la persistencia lo necesitan. Si viviera en `PlanCard` habría dos fuentes de verdad.
- **`typed` vive en `HashConfirm`**, porque solo ese componente necesita lo que se escribe. En `Inbox` sería un único valor compartido por todas las tarjetas R2.
- **Comparación estricta del hash**, sin `trim` ni cambio de mayúsculas: el hash es un identificador, no un texto libre.
- **`{...rest}` después de `type="button"`**, para que quien use `Button` pueda pedir `type="submit"` sin que el valor por defecto lo pise.

## Por qué la interfaz no es la frontera de seguridad

- **El paso 13 lo demuestra:** cambiar `onClick={() => onDecide(...)}` por `onClick={onDecide(...)}` hizo que React ejecutara `onDecide` al dibujar y aprobara planes sin que nadie decidiera.
- **`localStorage` se puede editar** desde el navegador. `readStoredDecisions` solo comprueba que lo guardado sea un objeto, no que sus claves y valores sean válidos.
- **El límite real está en el servidor (S08):** la pasarela no ejecuta una operación R2 por orden del modelo, y el servidor no deja borrar al token del agente; solo una persona autenticada que confirme el `plan_hash` puede hacerlo.
- **Para la semana 12:** la decisión tendría que enviarse al servidor con el `plan_hash` escrito y con el token de la persona, y el servidor tendría que comprobar el permiso, recalcular el hash y registrar quién aprobó.

## Uso de IA

Se usó OpenCode para escribir y corregir código y un asistente de chat como guía. Cada resultado se verificó con las pruebas, el navegador y `git diff`. La tabla completa con lo aceptado y rechazado está en el documento del entregable.
