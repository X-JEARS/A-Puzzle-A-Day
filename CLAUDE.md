# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"A Puzzle A Day" is a single-page web puzzle game with 14 polyomino pieces and 4 puzzle variants. Each variant uses a subset of pieces with a specific tray layout — fit pieces so that uncovered cells show today's month/day (and weekday, for applicable variants). No build system — plain HTML/CSS/JS served directly from the filesystem. No external dependencies.

## Commands

No build, lint, or test commands exist. To run the game, open `index.html` in a browser, or serve locally:

```bash
# Simple HTTP server (any of these work)
python3 -m http.server 8080
npx serve .
```

## Architecture

### Puzzle variants (v4)

4 puzzle variants defined in `VARIANTS[]` in `js/app.js`, each with a tray layout and piece subset. Switching is done by clicking the title — opens the variant selector overlay (`#variant-overlay`).

| Variant | Tray Type | Pieces |
|---------|-----------|--------|
| DragonFjord's A-Puzzle-A-Day | `no-weekdays` | 2,3,4,5,6,7,12,14 |
| JarringWords's Calendar Puzzle | `no-weekdays` | 2,3,4,5,6,7,12,13 |
| TheRammer Puzzle Calendar | `no-weekdays-alt` | 1,5,6,7,8,9,10,11,12 |
| WeekDay Calendar Puzzle | `full` | 1,2,4,6,7,8,10,12,13,14 |

**Tray layouts** (defined in `TRAY_CONFIGS`):
- `full`: Current layout — months + days 1-31 + 7 weekday cells. 6 blocked cells, 50 valid.
- `no-weekdays`: Weekday cells become blocked (+7 blocked = 13 total). Months + days 1-31 only, 43 valid.
- `no-weekdays-alt`: Like `no-weekdays` but days 29-31 at row 6 cols 4-6 (bottom-right) instead of bottom-left. Row 6 cols 0-3 blocked.

`BLOCKED_CELLS` is now dynamic (`_blockedCells` rebuilt per variant in `buildCellMeta()`). `isBlocked()` reads from `_blockedCells`. The tray outer rectangle height shrinks by one row for `no-weekdays` variants via `effectiveRows()` (returns 7 instead of 8).

### Rendering: Dual approach

- **Tray** (`#board-canvas`): Canvas 2D API with `devicePixelRatio` scaling. The tray recess (L-shaped playing area) and placed pieces are rendered on the same canvas. Piece shapes are built via `createRoundedGridPath()` which constructs per-cell paths with convex-only `arcTo` rounding; concave corners are filled afterward via `drawConcaveFill()` which draws a small arc sector at each concave grid intersection. Pieces use `drawPieceAt()` which clips to the compound path, fills with a bevel gradient, then applies concave corner fills. No per-cell strokes, no drop shadows, no piece numbers.
- **Piece bank** (`#piece-bank`): Individual `<canvas>` elements inside `<div>` containers in the DOM, one per unplaced piece. Rendered with the same `createRoundedGridPath()` + `drawConcaveFill()` technique. Bank piece cell size (`bankCellSize()`) scales proportionally to tray cell size (`cs * 0.45`, clamped to [13, 24]).

### Responsive layout

- **Portrait** (`width ≤ height`): `#game-area` uses `flex-direction: column` — tray on top, bank below. Bank spans full width. `calcCellSize()` uses both width and height constraints so all content fits viewport without scrolling (`body { overflow: hidden }`).
- **Landscape** (`width > height`): `#game-area` uses `flex-direction: row` via `@media (orientation: landscape)` — tray on left, bank on right. Bank limited to narrow width (`2 × 4 × bcs + 48`); overflows scroll internally. CellSize formula differs: width budget subtracts bank width, height budget excludes bank (since it's beside the tray).
- Orientation detection in JS via `window.innerWidth > window.innerHeight`. CSS uses `@media (orientation: landscape)`.

### Interaction model

- **Drag to place**: `pointerdown` on a bank piece → bank piece is hidden, after 5px movement a floating `position:fixed` canvas clone follows the cursor from the exact grab point (`dragGrabOffsetX/Y`). On release, the snapped grid position is calculated from cursor position minus grab offset (not piece-center approximation). If valid, piece is placed; otherwise re-appears in bank.
- **Drag from tray**: `pointerdown` on an occupied tray cell → after 5px movement, piece removed from board (bank not rendered until drop to avoid visual duplication), clone follows cursor from grab point. On release, re-placed on tray or returned to bank.
- **Click = rotate** (280ms timer), **double-click = flip** (350ms window). Uses `gameState.clickPieceId` in the timer callback to avoid closure scope bugs.
- **No click-to-pickup**: clicking a placed piece does nothing — dragging is the only way to remove a piece.
- **No drop indicator**: the tray does not show green/red placement previews. The floating clone following the cursor is the sole drag visual.
- **No piece shadows or numbers**: pieces render as clean colored shapes with bevel gradients only — no drop shadows, no ID numbers.

### Calendar history

- **History button** (📅) opens a calendar dialog showing a monthly grid. Days with completed puzzles are highlighted green; today has an accent border.
- **Month navigation**: `◀◀` (prev year), `◀` (prev month), `▶` (next month), `▶▶` (next year).
- **Click a green day** → restores that day's puzzle arrangement onto the board. Current in-progress state is auto-saved before restoring.
- **Return to Today** button appears inline in the date display when viewing a past solution. Clicking it reloads today's saved state.
- `resetAll()` also clears the viewing state, returning to today's fresh puzzle.
- Calendar rendering functions: `openHistoryDialog()`, `renderCalendar()`, `navigateCalendar()` in `js/app.js`.

### Game state

- `gameState` object in `js/app.js` holds `variant`, `pieces[]`, `cellSize`, `language`, `theme`, `viewingDate`, `calendarYear`, `calendarMonth`, `undoStack[]`, and drag/click tracking fields.
- Key drag fields: `dragPieceId`, `dragFromTray`, `dragMoved`, `dragGrabOffsetX/Y` (precise grab point on the piece), `dragBankContainer` (DOM ref to hidden bank element), `dragClientX/Y` (current cursor position).
- `viewingDate`: `null` = today's puzzle; `"YYYY-MM-DD"` string = viewing a past completed solution. When set, the date label shows "Viewing:" and a "Return to Today" button appears.
- Each piece: `id`, `baseShape` (2D array), `rotation` (0-3), `reflected` (bool), `row`/`col` (-1 = in bank, ≥0 = placed on tray).
- Piece count and tray valid cells vary by variant. `PIECE_DEFS` defines all 14 pieces; `initPieces()` filters by `getVariant().pieceIds`.
- `bankCellSize()` computes proportional bank cell size: `max(13, min(24, round(cs * 0.45)))`.
- `effectiveRows()` returns the visual tray height in rows (8 for `full` variant, 7 for no-weekday variants). Used in `canvasH()` and `calcCellSize()`.

### localStorage keys (v4)

Game state and history are variant-scoped; settings are shared.

| Key | Content |
|-----|---------|
| `puzzle_a_day_v4_{variantId}` | Current game state: `{ pieces: [{id,rotation,reflected,row,col}], date: "YYYY-MM-DD" }` |
| `puzzle_a_day_hist_v4_{variantId}` | History object: `{ "YYYY-MM-DD": { pieces: [...] } }` — per-variant, keyed by date |
| `puzzle_a_day_cfg_v4` | Settings: `{ language, theme, variant }` |

Variant-scoped keys (via `storeKey()`/`historyKey()`) isolate saves per puzzle variant. Old v3 keys (`puzzle_a_day_v3`, etc.) are read as fallback for DragonFjord variant migration. Settings key bumped to v4 to include `variant` field.

### Theming

CSS custom properties on `:root` define light theme; `@media (prefers-color-scheme: dark)` overrides for dark; `.dark`/`.light` body classes force a specific theme. Tray uses `getComputedStyle` to read CSS variables at render time. `isDark()` returns the effective theme based on user setting + media query.

### i18n

4 languages (zh-CN, en, ja, ko). `CELL_META` 2D array is rebuilt when language changes (`buildCellMeta()`). UI text uses `data-i18n` attributes populated by `updateAllI18n()` which reads from the `TRANSLATIONS` object. Calendar weekday headers use the `cal_weekdays` i18n key (7-element array, Sunday-first).

### CSV data files

- `方块设计.csv` (UTF-8): 14 piece shapes (方块一 to 方块十四) — `1` = filled cell, `0` = empty. The authoritative piece definitions are the JS `PIECE_DEFS` array; the CSV is the design source.
- `托盘设计.csv`: Tray layout — months, days 1-31, and weekdays. **This file was GBK-encoded** and was converted to UTF-8 via `iconv -f GBK -t UTF-8`. If you need to re-read the original, convert first.

## Key rendering constraints

Do not use `roundRect` or per-cell strokes. All shapes are built via `createRoundedGridPath(grid, ox, oy, cs)` which constructs a compound `Path2D`:
- Each filled cell contributes a sub-path with `moveTo`/`lineTo`/`arcTo` (not `rect`).
- Only **convex** corners are rounded (exactly 1 of 4 cells filled at a grid intersection). This is the `convex()` check inside `createRoundedGridPath()`.
- **Concave** corners (3 of 4 filled) are handled separately: after the main shape fill, `drawConcaveFill()` draws a small arc sector at each concave corner. It builds a path from the corner point → along one boundary edge to a tangent point → `arc()` centered at the outer corner of the fill rect → along the other boundary edge back to the corner, then fills with the matching color/gradient. Convex corners get `arcTo` in the per-cell sub-paths; concave corners get `arc()` in the post-fill pass.
- Sub-paths are combined via `path.addPath(cp)` — the union of all cell sub-paths forms the final shape.
- Then `ctx.clip(path)` + single fill/gradient — see `drawPieceAt()` in `js/app.js`.

The corner radius scales with cell size: `max(2, min(round(cs * 0.1), 8))`. No drop shadows, no piece ID numbers.

### Concave corner helper functions

- `findConcaveCorners(grid, ox, oy, cs)` — returns `[{cx, cy, emptyQ}]` for each grid intersection where exactly 3 of 4 cells are filled. `emptyQ` is `'nw'|'ne'|'sw'|'se'` indicating the empty quadrant.
- `drawConcaveFill(ctx, cx, cy, rad, emptyQ, color, grad)` — draws the arc sector at one concave corner. Used in `drawPieceAt()`, `renderPieceBank()`, `createDragClone()`, and tray recess rendering.
