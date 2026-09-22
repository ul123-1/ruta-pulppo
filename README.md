# Ruta Pulppo

App de aprendizaje estilo Duolingo para asesores inmobiliarios de Pulppo. Publicada como Artifact privado en claude.ai.

Contiene dos rutas de aprendizaje, la guía de primer ingreso a la plataforma, el checklist de tareas del asesor, las 5 noticias de la semana con un asistente, un simulador de clientes y un panel de seguimiento para el líder.

## Qué hay en el repo

| Archivo | Qué es |
|---|---|
| `ruta-pulppo.html` | La app completa, lista para publicar. Un solo archivo: CSS, JS y logo en base64. |
| `src-ruta-pulppo.html` | El mismo archivo con `__LOGO__` en lugar del base64 del isotipo. Es la fuente para editar. |
| `docs/isotipo.png` | Isotipo de Pulppo que se incrusta en el build. |
| `scripts/validar-mongo.mjs` | Prueba de conexión a MongoDB y diagnóstico de colecciones. No se usa dentro de la app. |
| `data/news/current.json` | Edición de noticias cargada en la base de la app. Sirve de referencia del formato. |
| `docs/agente-noticias.md` | Prompt de la tarea programada que publica las noticias cada lunes. |
| `docs/datos.md` | Estructura de datos de la app y reglas de acceso. |

## Build

`ruta-pulppo.html` es `src-ruta-pulppo.html` con el placeholder `__LOGO__` sustituido por el base64 del isotipo:

```bash
python3 - <<'EOF'
import base64
src = open('src-ruta-pulppo.html').read()
logo = base64.b64encode(open('docs/isotipo.png','rb').read()).decode()
open('ruta-pulppo.html','w').write(src.replace('__LOGO__', logo))
EOF
```

## Publicación

La app vive como Artifact en claude.ai y se actualiza republicando `ruta-pulppo.html` sobre la misma URL. Declara tres capacidades del runtime:

- `db` — progreso compartido de cada asesor y la edición de noticias.
- `user` — identidad del asesor (scope `profile`) para el ranking y el panel del líder.
- `sample` — el asistente de noticias y el simulador de clientes, que corren con la cuenta de Claude de quien abre la app.

Reglas de acceso declaradas:

```json
{"db": {"rules": [
  {"path": "progress", "read": "interact", "write": "admin"},
  {"path": "progress/{self}", "write": "interact"},
  {"path": "news", "read": "view", "write": "admin"}
]}}
```

Cada asesor escribe solo su documento `progress/<su id>` y todos leen el resto, que es lo que alimenta el ranking y el panel del líder.

Para que un asesor guarde su avance, hay que compartirle la app con permiso **"Puede interactuar"**. Con permiso de solo lectura la app se abre pero no guarda.

## Contenido

- **Plataforma Pulppo:** 12 unidades sobre la plataforma y el oficio, con 5 preguntas cada una.
- **Academia del Broker:** 9 temas del sector en México (compraventa, expediente, créditos, arrendamiento, valuación, impuestos, negociación, marketing, ética y cumplimiento) con 6 ejercicios cada uno: ordenar, emparejar, calcular, escenarios y opción múltiple. Tiene vidas, combos, insignias, reto del día y repaso de errores.
- **Simulador de clientes:** 4 personajes que interpreta Claude, con calificación de 0 a 100 al terminar.
- **Primeros pasos:** 9 pasos para el primer ingreso a broker.pulppo.com.
- **Tareas:** 10 de onboarding y 6 hábitos semanales que se reinician cada lunes.

Las cifras fiscales y legales de la Academia (ISR, UMA, umbrales de la ley antilavado, tope de renta en CDMX) están fechadas a septiembre de 2026 y deben revisarse cada año.

## Pendiente

Validar automáticamente el checklist contra la base de Pulppo (WhatsApp vinculado, primera propiedad publicada, propiedad con ACM, primera búsqueda, primera visita confirmada, tiempo de primera respuesta). Requiere una conexión a MongoDB desde una máquina con acceso al cluster. Ver `scripts/validar-mongo.mjs`.
