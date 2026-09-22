# Estructura de datos

La app guarda todo en la base del Artifact (capacidad `db`) y, como respaldo, en el `localStorage` del navegador de cada asesor.

## `progress/<userId>`

Un documento por asesor. El id es el que devuelve la capacidad `user`. Cada asesor escribe solo el suyo; todos pueden leer los demás (ranking y panel del líder).

```json
{
  "xp": 340,
  "streak": 4,
  "lastDay": "2026-09-22",
  "today": { "day": "2026-09-22", "xp": 30 },
  "lessons": { "u1": { "best": 5, "at": 1790000000000, "tries": 1 } },
  "academy": { "a1": { "best": 6, "at": 1790000000000, "tries": 1 } },
  "guide": { "g1": 1790000000000 },
  "tasks": { "t1": 1790000000000 },
  "weekly": { "2026-W39": { "w1": 1790000000000 } },
  "mistakes": ["a3:2", "a6:4"],
  "dailyDone": "2026-09-22",
  "sims": { "s1": 78 },
  "inmo": "Inmobiliaria Norte",
  "updatedAt": 1790000000000
}
```

- `lessons` usa los ids de las unidades de plataforma (`u1`…`u12`), `academy` los de la Academia (`a1`…`a9`).
- `weekly` se guarda por semana ISO y conserva las últimas 8.
- `mistakes` son claves `unidad:índiceDePregunta`, máximo 40, y alimentan "Repasar errores".
- `sims` guarda la mejor calificación de cada escenario del simulador.
- `updatedAt` es lo que el panel del líder usa para "última actividad".

## `news/current`

Un solo documento con la edición de la semana. Lo escribe la tarea programada de los lunes (ver `agente-noticias.md`) o la herramienta de base de datos desde un chat.

```json
{
  "week": "Semana del 21 de septiembre de 2026",
  "updatedAt": 1790006400000,
  "items": [
    {
      "topic": "Tasas",
      "date": "6 ago 2026",
      "title": "Titular de máximo 110 caracteres",
      "summary": "Dos o tres frases con cifras concretas.",
      "why": "Qué significa para el asesor en su trabajo diario.",
      "source": "Nombre del medio",
      "url": "https://…"
    }
  ]
}
```

Siempre 5 elementos, del más al menos importante.

## XP

| Acción | XP |
|---|---|
| Respuesta correcta al primer intento | 10 |
| Combo de 3 o más seguidas | +2 por respuesta |
| Lección perfecta | +5 |
| Repaso de una lección ya completada | la mitad |
| Paso de Primeros pasos | 5 |
| Tarea de onboarding | 15 |
| Hábito semanal | 5 |
| Reto del día | +15 |
| Simulador de clientes | 10 + calificación ÷ 10 |

La racha sube el primer día que el asesor gana XP y se rompe si pasa un día sin actividad.
