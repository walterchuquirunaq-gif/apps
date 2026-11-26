# Calistenia general (calistenia para todos) — notas técnicas para Claude

> Léelo antes de cambiar o arreglar algo de esta app. Así no hace falta volver a investigar.
> Creada el 26/11/2026 a partir de la app personal de Walter ("Calistenia_Semana (7)(2).html").

## 1. Qué es
- Versión **para cualquier persona** de la app de calistenia de Walter: **solo piso, pared y silla** (nada de pesas, barra, mochila, mesa ni cama).
- Cada persona elige **3, 4 o 5 días** y qué días (pestaña *Mi semana*). La rutina se arma sola.
- Mismo diseño y funciones que la app personal: Hoy, Cómo usar, Mi semana, Calendario, Progreso, Ejercicios, Teoría, 🌱 Esencial, modo guiado con cronómetro y voz, prueba de máximo, logros, compañero por WhatsApp, medidas, recordatorios, respaldo.
- Publicada (o por publicar) en `https://walterchuquirunaq-gif.github.io/apps/calistenia-para-todos/` (repo público `apps`).
- **La app personal no se toca**: vive aparte en `apps/calistenia/`.

## 2. Archivos
Carpeta de la app (`para_github/calistenia-para-todos/`, es lo que se sube a GitHub):
| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (un solo archivo, ~510 KB; letras en base64). **Se genera con `construir.py`.** |
| `sw.js` | Service worker: primero la red, si no hay (o tarda >4 s) usa lo guardado. Caché `calgeneral-v1`. |
| `manifest.webmanifest` | Nombre "Calistenia general", corto "Calistenia", tema `#eceff3`. |
| `icono-180/192/512.png`, `icono-maskable-512.png` | Ícono verde con un monigote en plancha (hecho por Claude). |
| `LEEME_TECNICO.md` | Este archivo. |

Taller (`para_github/_taller_calistenia_para_todos/`, **no se sube**):
| Archivo | Qué es |
|---|---|
| `base_calistenia_personal.html` | Copia de la app personal usada como base. |
| `construir.py` | Arma `index.html`: aplica todos los cambios sobre la base. Cada cambio exige que el texto buscado aparezca **una sola vez**; si no, se detiene y no escribe nada. |
| `b_anim.js` | Figuras nuevas (monigotes) y copias sin mancuerna. |
| `b_pat.js` | Escaleras (`PAT`) y complementarios (`FIX`) nuevos. |
| `b_dom.js` | Ejercicios del *día activo* (antes "domingo activo"). |
| `b_tec.js` | Fichas de técnica nuevas, ajustes a fichas viejas, `TECMAP` y `FIXTEC`. |
| `b_plan.js` | Plan de 3/4/5 días: `PLANES`, `buildWeek()`, calentamientos. |
| `b_semana.js` | Pestaña *Mi semana* (elegir días). |
| `b_teo_abs.html`, `b_teo_rr.html` | Partes nuevas de la Teoría. |

Reconstruir: `python3 construir.py base_calistenia_personal.html ../calistenia-para-todos/index.html`

**Dos maneras de cambiar algo:**
1. Cambio chico de texto o dato → se puede editar directo `index.html` (y anotarlo aquí en la sección 9).
2. Cambio grande o si la app personal cambió y se quiere heredar → editar los `b_*` o `construir.py` y reconstruir. **Ojo:** si se editó `index.html` a mano, esos cambios se pierden al reconstruir; pásalos antes a `construir.py`.

## 3. Mapa de `index.html` (buscar con estos marcadores)
| Marcador | Qué hay |
|---|---|
| `<!--app: para instalarla` | Etiquetas de la app instalable (manifest, íconos). |
| `const ANIM={` | Monigotes. Pose = `P` cadera, `t` ángulo del tronco, `A/A2` brazos, `L/L2` piernas (`w`/`f` = punto al que llega la mano/pie, `a` = ángulos, `rel` = desplazamientos). `top:1` = vista desde arriba, `front:1` = de frente. |
| `/* ===== Calistenia general: figuras nuevas` | Figuras nuevas (ver sección 5). |
| `const PAT={` | Escaleras: E, V, T, P, B, CA, CF, CO, K, M, F, G. |
| `const FIX={` | Complementarios: fondos, diamante, gemelo, pared, salto. |
| `/* ☀️ día activo` | angel, tw, abd, tib, bal (días de descanso, 2 series suaves). |
| `const TEC={` | Fichas de técnica (muchas viejas quedan sin usar, no estorban). |
| `/* fichas de técnica nuevas (Calistenia general) */` | Fichas nuevas + `TECMAP` (qué ficha usa cada nivel) + `FIXTEC`. |
| `const TSRC=[` | Fuentes de técnica T1…T68 (T57–T68 son nuevas). |
| `/* ===== Plan de la semana: 3, 4 o 5 días` | `PLANES`, `PDIAS`, `ABSROT`, `buildWeek()`, `DTN`/`DTY`, `WARM`, `WARMX`. |
| `const YP={` | Posturas de yoga. `YDAY` tiene `upper` y `full` agregados. |
| `const SUBS={` | Opciones de 🔁 Cambiar. |
| `const KEY="calistenia_general_v1"` | Guardado. `DEF` = valores iniciales (todo nivel 1, plan 3 días L-M-V, color verde). |
| `function renderHoy` / `renderSemana` / `renderCal` / `renderProg` / `renderLib` / `renderTeo` / `renderGuia` / `renderEsencial` | Cada pestaña. |
| `function openSheet` | Menú ⋯ (incluye "Días de entrenamiento" → Mi semana). |
| `location.hash==="#galeria"` | Abriendo `index.html#galeria` se ven **todas las figuras** (A y B) para revisarlas. |

## 4. Cómo se arma la semana
- `S.plan = {n: 3|4|5, days: [números de día, 0=domingo … 6=sábado]}`; `S.planSet=1` cuando la persona ya eligió.
- `buildWeek()` llena `WEEK`, `ABS`, `EXTRA` y `DAYTYPE` para los 7 días. Los días no elegidos son `rest` (descanso con *día activo* opcional). Se llama al cargar, al cambiar el plan, al cambiar "Cardio en días de piernas", al cargar un respaldo y al borrar todo.
- Plantillas (`PLANES`): 3 días = cuerpo completo A/B/C; 4 días = tren superior A, inferior A, superior B, inferior B; 5 días = sup A, inf A, cuerpo completo, sup B, inf B. Se asignan a los días elegidos en orden de lunes a domingo.
- Abdomen: 2 escaleras por día rotando (`ABSROT`); cardio + estabilidad: 1 de cada uno. Con la opción **Suave** (por defecto) los días de piernas y de cuerpo completo llevan cardio en el suelo (M).
- En esta versión el abdomen y el cardio van con **2 series** (en la personal, 3). Sesión completa ≈ 50–55 min (con calentamiento y yoga); en parejas o exprés, menos.
- La racha, los logros y el resumen del mes tratan como descanso a **todos los días de descanso del plan** (antes era solo el domingo).
- "En casa / Afuera" ya no existe: `S.place` siempre es `"casa"` y cada día tiene la misma lista en `casa` y `fuera`.

## 5. Escaleras y figuras
| Escalera | Niveles (figura) |
|---|---|
| E Planchas | pared (pw) · inclinadas en silla (p1) · de rodillas (pk) · normales (p2) · lentas 3-1-1 · pies en silla (p4) · pseudo-planche (p5) · arquero |
| V Hombro | pike (v1) · pike pies en silla (v2) · parada contra la pared (v3) · negativas (v4) · flexión en parada (v4) |
| T Espalda sin barra | superman Y (sup) · ángeles invertidos (snow) · T y W (dTW) · superman con jalón (pullP) · jalón lento |
| P Piernas | sentarse y pararse (sit) · sentadilla (s1) · con pausa · zancada (s3n) · búlgara (s4) · búlgara lenta · pistol a la silla (s6) · shrimp (shr) |
| B Cadera | puente (h1) · pies en silla (h1c) · a una pierna (h2) · una pierna en silla (h2c) · peso muerto a una pierna lento (h4n) |
| CA Abdomen frontal | plancha antebrazos (c1) · hollow (c2) · hollow rocks · RKC (c1L) · body saw (saw) · body saw lento |
| CF Abdomen bajo | crunch inverso (krc) · elevación de piernas (lr) · con pausa · V-ups (vu) · V-ups con pausa |
| CO Oblicuos | igual que la personal, giro ruso sin peso (rtn) |
| K / M Cardio | igual que la personal |
| F Estabilidad | perro de caza (bd) · oso quieto (brh) · toques de hombro (tap) · toques lentos |
| G Cuerpo completo | gusano (inch) · caminata de oso (br) · subidas a la silla (sun) · gusano con plancha |

Figuras **nuevas** (hechas por Claude, aproximadas): pw, pk, sit, h1c, h2c, bd, brh, tap, saw, krc, calfF, snow, pullP, wangel. Copias sin mancuerna: s3n, h4n, sun, rtn. Revisarlas en `#galeria`.

## 6. Cómo agregar o cambiar un ejercicio
1. Nivel nuevo en una escalera: agregarlo en `b_pat.js` (orden = dificultad), su ficha en `TECMAP` (`b_tec.js`) en la misma posición, y si hace falta una ficha nueva en `Object.assign(TEC,{…})` con fuente en `TSRC` (en `construir.py`).
2. Si necesita figura: copiar una parecida en `b_anim.js` y ajustar poses; revisar en `#galeria`.
3. Los niveles se guardan como número: **insertar un nivel en medio corre el nivel de quien ya lo usa**. Mejor agregar al final, o escribir una migración en `migrate()` (hoy vacía).
4. Regla fija: **solo piso, pared y silla.** En los estiramientos de yoga quedan menciones de cojín o toalla solo como opción de comodidad (avisado en *Cómo usar*).

## 7. Datos y privacidad
- Guarda en `localStorage` con la clave `calistenia_general_v1` y el cronómetro en `calistenia_general_timer`: **distintas a la app personal** (`calistenia_semana_v1`), porque las dos viven en el mismo sitio (`walterchuquirunaq-gif.github.io`) y si no se mezclarían.
- Respaldo: `calistenia_general_respaldo_AAAA-MM-DD.json` (⋯ → Guardar / Cargar respaldo).
- No lleva datos de Walter: nada de nombre, iglesia, profesión ni su equipo. Compañero, teléfono y medidas los llena cada persona y quedan solo en su celular.

## 8. Cómo se probó (26/11/2026)
- Playwright + Chrome de escritorio, ancho de celular (400 px): todas las pestañas sin errores; plan de 3, 4 y 5 días; elegir días; los 7 días de la semana; modo guiado (series y descansos); respaldo guardado y cargado en otro navegador; instalable (Chrome sin errores de instalación); sin internet abre lo guardado.
- **No probado en un celular real ni en iPhone.**

## 9. Registro de cambios
- 26/11/2026 — Creación a partir de la app personal (semana 7).
