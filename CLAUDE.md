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

- **Tray** (`#board-canvas`): Canvas 2D API with `devicePixelRatio` scaling. The tray recess (L-shaped playing area) and placed pieces are rendered on the same canvas. Both tray recess and pieces use `createOuterBoundaryPath()` to build a single perimeter `Path2D` with `arcTo` rounding at both convex and concave corners. The path serves as the clip region for fill + inner stroke. Pieces add a 3-stop bevel gradient (lighter → base color → darker, computed per-piece via `lighter()`/`darker()` helpers); the recess uses a solid `trayRecess` fill. Both apply an inner bevel-gradiented stroke along the perimeter. No drop shadows, no piece numbers.
- **Piece bank** (`#piece-bank`): Individual `<canvas>` elements inside `<div>` containers in the DOM, one per unplaced piece. Rendered with the same `createOuterBoundaryPath()` clip + 3-stop gradient + inner stroke technique as tray pieces. Bank piece cell size (`bankCellSize()`) scales proportionally to tray cell size (`cs * 0.45`, clamped to [13, 24]).

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
- **No piece shadows or numbers**: pieces render as clean colored shapes with 3-stop bevel gradients and an inner perimeter stroke — no drop shadows, no ID numbers.

### UI buttons — SVG icons

Header and action buttons use **inline SVG icons** instead of emoji. SVGs use `stroke="currentColor"` to inherit text color from CSS, so they automatically adapt to theme changes and button states (e.g., `.btn-danger` red → white on hover).

- **Language** (`#btn-lang`): globe SVG
- **Theme** (`#btn-theme`): moon SVG (light/auto-light) / sun SVG (dark/auto-dark), toggled via `applyTheme()`
- **History** (`#btn-history`): calendar SVG
- **Help** (`#btn-help`): question-mark-circle SVG — opens the help dialog
- **Reset** (`#btn-reset`): double-arrow cycle SVG (clockwise)
- **Undo** (`#btn-undo`): single curved-arrow SVG (counter-clockwise)

### Help dialog

The help dialog (`#help-overlay`) explains controls (drag, click-to-rotate, double-click-to-flip) and the win condition. Opened via the `?` button in the header. Content uses `data-i18n` keys: `help_title`, `help_controls_title`, `help_ctrl_drag/rotate/flip/return`, `help_goal_title`, `help_goal`. A footer line says "Generated by DeepSeek V4 Pro, designed by hanasaka.net" with a clickable link (opens in new tab).

### Calendar history

- **History button** (calendar SVG icon) opens a calendar dialog showing a monthly grid. Days with completed puzzles are highlighted green; today has an accent border.
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

Theme cycles via `toggleTheme()`: **auto → dark → light → auto**. Auto mode follows `prefers-color-scheme` and shows a small accent dot indicator (`.theme-auto::after`) on the theme button. The theme button toggles between moon and sun SVG icons via `applyTheme()`; the button `title` attribute updates to reflect the current state.

### i18n

4 manual languages (zh-CN, en, ja, ko) plus a **"Follow System"** option (`language: 'auto'`). When auto is selected, `detectSystemLanguage()` maps `navigator.language` to the closest supported locale (`zh*` → zh-CN, `ja*` → ja, `ko*` → ko, else en). The `resolvedLanguage()` helper returns the effective language code; all consumers (`t()`, `buildCellMeta()`, `getTodayTarget()`, `renderCalendar()`) use `resolvedLanguage()` instead of `gameState.language` directly. A `languagechange` event listener rebuilds the UI when the system language changes in auto mode.

`CELL_META` 2D array is rebuilt when language changes (`buildCellMeta()`). UI text uses `data-i18n` attributes populated by `updateAllI18n()` which reads from the `TRANSLATIONS` object. Calendar weekday headers use the `cal_weekdays` i18n key (7-element array, Sunday-first).

### CSV data files

- `方块设计.csv` (UTF-8): 14 piece shapes (方块一 to 方块十四) — `1` = filled cell, `0` = empty. The authoritative piece definitions are the JS `PIECE_DEFS` array; the CSV is the design source.
- `托盘设计.csv`: Tray layout — months, days 1-31, and weekdays. **This file was GBK-encoded** and was converted to UTF-8 via `iconv -f GBK -t UTF-8`. If you need to re-read the original, convert first.

## Key rendering constraints

Do not use `roundRect` (except for the outer tray frame). All piece and recess shapes are built via `createOuterBoundaryPath(grid, ox, oy, cs)` which traces the outer perimeter of a polyomino via edge-cancellation + perimeter walk. Both **convex** and **concave** corners are rounded with `arcTo` in a single `Path2D`. The path is used as the clip region for fill + gradient + inner stroke.

### Piece fill gradient
Pieces use a 3-stop bevel gradient (lighter → base color → darker) matching the tray's approach. Stops are computed per-piece via `lighter(hex, amt)` and `darker(hex, amt)` which blend the base color toward white or black.

### Inner stroke
All shapes (pieces and tray recess) have an inner stroke along the outer perimeter (inside the clip, double line-width so only the inner half shows). The stroke uses its own bevel gradient: lighter at top-left, near-transparent at center, darker at bottom-right.

### Tray recess
The tray recess uses the same `createOuterBoundaryPath` + clip + fill + inner stroke approach as pieces. The recess fill is solid `trayRecess` color; the stroke gradient uses semi-transparent light/dark stops.

The corner radius scales with cell size: `max(2, min(round(cs * 0.1), 8))`. No drop shadows, no piece ID numbers.
