// ============================================================
// A Puzzle A Day - Complete Game Engine v3
// ============================================================

// ============================================================
// DATA: Piece Definitions
// ============================================================
const PIECE_DEFS = [
    { id: 1, shape: [[1, 1, 1, 1]] },
    { id: 2, shape: [[1, 1, 1, 1], [0, 0, 0, 1]] },
    { id: 3, shape: [[1, 1, 1, 0], [0, 0, 1, 1]] },
    { id: 4, shape: [[1, 1, 1], [0, 1, 1]] },
    { id: 5, shape: [[1, 1, 1], [1, 0, 1]] },
    { id: 6, shape: [[1, 1, 1], [0, 0, 1]] },
    { id: 7, shape: [[0, 1, 1], [1, 1, 0]] },
    { id: 8, shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
    { id: 9, shape: [[1, 1, 1], [0, 1, 0], [0, 1, 0]] },
    { id: 10, shape: [[1, 1, 0], [0, 1, 0], [0, 1, 1]] },
];

const PIECE_COLORS = [
    '#E85D4E', '#4A9FE8', '#3ECB7B', '#F5A040', '#9B6FC0',
    '#1EC0A8', '#E88040', '#E85578', '#10B8CC', '#8EC850'
];

const PIECE_COLORS_DARK = [
    '#F07070', '#60B0E0', '#50E090', '#F5B840', '#B880D0',
    '#40D0B8', '#F09050', '#F05080', '#30D8F0', '#A0D860'
];

// ============================================================
// DATA: Tray
// ============================================================
const TRAY_COLS = 7;
const TRAY_ROWS = 8;
const TRAY_PADDING = 18;

const BLOCKED_CELLS = new Set([
    '0,6', '1,6', '7,0', '7,1', '7,2', '7,3'
]);

const CELL_META = [];

function buildCellMeta(lang) {
    const months = I18N_MONTHS[lang];
    const weekdays = I18N_WEEKDAYS[lang];
    for (let r = 0; r < TRAY_ROWS; r++) {
        CELL_META[r] = [];
        for (let c = 0; c < TRAY_COLS; c++) {
            const key = `${r},${c}`;
            if (BLOCKED_CELLS.has(key)) {
                CELL_META[r][c] = { label: '', type: 'blocked' };
            } else if (r === 0) {
                CELL_META[r][c] = { label: months[c], type: 'month' };
            } else if (r === 1) {
                CELL_META[r][c] = { label: months[6 + c], type: 'month' };
            } else if (r >= 2 && r <= 6) {
                const dayNum = (r - 2) * 7 + c + 1;
                if (dayNum <= 31) {
                    CELL_META[r][c] = { label: String(dayNum), type: 'day' };
                } else {
                    CELL_META[r][c] = { label: weekdays[c - 3], type: 'weekday' };
                }
            } else if (r === 7) {
                CELL_META[r][c] = { label: weekdays[4 + (c - 4)], type: 'weekday' };
            }
        }
    }
}

// ============================================================
// I18N
// ============================================================
const I18N_MONTHS = {
    'zh-CN': ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    'en': ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    'ja': ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    'ko': ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
};

const I18N_WEEKDAYS = {
    'zh-CN': ['周日','周一','周二','周三','周四','周五','周六'],
    'en': ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    'ja': ['日曜','月曜','火曜','水曜','木曜','金曜','土曜'],
    'ko': ['일요','월요','화요','수요','목요','금요','토요'],
};

const TRANSLATIONS = {
    'zh-CN': {
        title:'A Puzzle A Day', today:'今日目标',
        reset:'🔁 重置', undo:'↩️ 撤销', close:'关闭',
        congrats:'🎉 恭喜！', solved:'你完成了今天的拼图！',
        history:'拼图历史', select_lang:'选择语言 / Select Language',
        no_history:'还没有完成记录，快来挑战今天的拼图吧！',
        exposed:'露出', confirm_reset:'确定要重置吗？所有进度将丢失。',
        drag_hint:'拖入托盘 | 单击旋转 | 双击翻转',
        tray_empty:'所有方块已放入托盘 ✓',
    },
    'en': {
        title:'A Puzzle A Day', today:'Today\'s Target',
        reset:'🔁 Reset', undo:'↩️ Undo', close:'Close',
        congrats:'🎉 Congratulations!', solved:'You solved today\'s puzzle!',
        history:'Puzzle History', select_lang:'Select Language',
        no_history:'No records yet. Solve today\'s puzzle!',
        exposed:'Exposed', confirm_reset:'Are you sure? All progress will be lost.',
        drag_hint:'Drag to board | Click to rotate | Double-click to flip',
        tray_empty:'All pieces placed ✓',
    },
    'ja': {
        title:'A Puzzle A Day', today:'今日の目標',
        reset:'🔁 リセット', undo:'↩️ 元に戻す', close:'閉じる',
        congrats:'🎉 おめでとう！', solved:'今日のパズルを解きました！',
        history:'パズル履歴', select_lang:'言語選択 / Select Language',
        no_history:'まだ記録がありません。今日のパズルに挑戦しましょう！',
        exposed:'露出', confirm_reset:'リセットしますか？すべての進行状況が失われます。',
        drag_hint:'ドラッグで配置 | クリックで回転 | ダブルクリックで反転',
        tray_empty:'すべてのピースが配置されました ✓',
    },
    'ko': {
        title:'A Puzzle A Day', today:'오늘의 목표',
        reset:'🔁 초기화', undo:'↩️ 되돌리기', close:'닫기',
        congrats:'🎉 축하합니다!', solved:'오늘의 퍼즐을 풀었습니다!',
        history:'퍼즐 기록', select_lang:'언어 선택 / Select Language',
        no_history:'아직 기록이 없습니다. 오늘의 퍼즐에 도전하세요!',
        exposed:'노출', confirm_reset:'초기화하시겠습니까? 모든 진행 상황이 손실됩니다.',
        drag_hint:'드래그하여 배치 | 클릭 회전 | 더블클릭 뒤집기',
        tray_empty:'모든 조각이 배치되었습니다 ✓',
    },
};

const LANGUAGES = [
    { code:'zh-CN', name:'中文', nativeName:'中文 (Simplified Chinese)' },
    { code:'en', name:'English', nativeName:'English' },
    { code:'ja', name:'日本語', nativeName:'日本語 (Japanese)' },
    { code:'ko', name:'한국어', nativeName:'한국어 (Korean)' },
];

function t(key, params) {
    let text = TRANSLATIONS[gameState.language]?.[key] || TRANSLATIONS['en'][key] || key;
    if (params) for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, v);
    return text;
}

function updateAllI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
}

// ============================================================
// STATE
// ============================================================
const gameState = {
    pieces: [],
    cellSize: 52,
    language: 'zh-CN',
    theme: 'auto',
    undoStack: [],
    // Drag state
    dragPieceId: null,
    dragFromTray: false,
    dragStartX: 0,
    dragStartY: 0,
    dragMoved: false,
    dragGrabOffsetX: 0,
    dragGrabOffsetY: 0,
    dragClientX: 0,
    dragClientY: 0,
    // Click tracking
    clickPieceId: null,
    clickTimer: null,
    clickTime: 0,
    // Bank drag: reference to the DOM element being dragged
    dragBankContainer: null,
};

// Floating drag clone element
let dragClone = null;

function initPieces() {
    gameState.pieces = PIECE_DEFS.map(def => ({
        id: def.id,
        baseShape: def.shape.map(row => [...row]),
        rotation: 0,
        reflected: false,
        row: -1,
        col: -1,
    }));
    gameState.undoStack = [];
    clearDragState();
}

function clearDragState() {
    // Restore bank container visibility if it was hidden during drag
    if (gameState.dragBankContainer) {
        gameState.dragBankContainer.style.display = '';
        gameState.dragBankContainer = null;
    }
    gameState.dragPieceId = null;
    gameState.dragFromTray = false;
    gameState.dragMoved = false;
    gameState.dragGrabOffsetX = 0;
    gameState.dragGrabOffsetY = 0;
    gameState.dragClientX = 0;
    gameState.dragClientY = 0;
    gameState.clickPieceId = null;
    if (gameState.clickTimer) { clearTimeout(gameState.clickTimer); gameState.clickTimer = null; }
    gameState.clickTime = 0;
    if (dragClone) { dragClone.remove(); dragClone = null; }
}

// ============================================================
// PIECE TRANSFORMATIONS
// ============================================================
function rotateCW(shape) {
    const rows = shape.length, cols = shape[0].length;
    const result = [];
    for (let c = 0; c < cols; c++) {
        const newRow = [];
        for (let r = rows - 1; r >= 0; r--) newRow.push(shape[r][c]);
        result.push(newRow);
    }
    return result;
}

function reflectH(shape) {
    return shape.map(row => [...row].reverse());
}

function getTransformedShape(piece) {
    let shape = piece.baseShape.map(row => [...row]);
    for (let i = 0; i < (piece.rotation % 4); i++) shape = rotateCW(shape);
    if (piece.reflected) shape = reflectH(shape);
    return shape;
}

function getPieceCells(piece, row, col) {
    const shape = getTransformedShape(piece);
    const cells = [];
    for (let r = 0; r < shape.length; r++)
        for (let c = 0; c < shape[r].length; c++)
            if (shape[r][c] === 1) cells.push({ row: row + r, col: col + c });
    return cells;
}

function getPiecePixelBounds(piece, ox, oy, cs) {
    const shape = getTransformedShape(piece);
    let minR = 999, maxR = -1, minC = 999, maxC = -1;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                minR = Math.min(minR, r); maxR = Math.max(maxR, r);
                minC = Math.min(minC, c); maxC = Math.max(maxC, c);
            }
        }
    }
    return {
        x: ox + minC * cs, y: oy + minR * cs,
        w: (maxC - minC + 1) * cs, h: (maxR - minR + 1) * cs,
        rows: shape.length, cols: shape[0]?.length || 0,
    };
}

// ============================================================
// PLACEMENT LOGIC
// ============================================================
function isBlocked(row, col) {
    if (row < 0 || row >= TRAY_ROWS || col < 0 || col >= TRAY_COLS) return true;
    return BLOCKED_CELLS.has(`${row},${col}`);
}

function canPlace(piece, row, col, ignorePieceId) {
    const cells = getPieceCells(piece, row, col);
    for (const cell of cells) {
        if (cell.row < 0 || cell.row >= TRAY_ROWS || cell.col < 0 || cell.col >= TRAY_COLS) return false;
        if (isBlocked(cell.row, cell.col)) return false;
        for (const other of gameState.pieces) {
            if (other.id === piece.id) continue;
            if (other.id === ignorePieceId) continue;
            if (other.row < 0) continue;
            const oc = getPieceCells(other, other.row, other.col);
            if (oc.some(o => o.row === cell.row && o.col === cell.col)) return false;
        }
    }
    return true;
}

function placePieceOnBoard(pieceId, row, col) {
    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece || !canPlace(piece, row, col)) return false;
    gameState.undoStack.push({
        pieceId, prevRow: piece.row, prevCol: piece.col,
        prevRotation: piece.rotation, prevReflected: piece.reflected,
    });
    piece.row = row;
    piece.col = col;
    saveGame();
    return true;
}

function removePieceFromBoard(pieceId) {
    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece || piece.row < 0) return;
    gameState.undoStack.push({
        pieceId, prevRow: piece.row, prevCol: piece.col,
        prevRotation: piece.rotation, prevReflected: piece.reflected,
    });
    piece.row = -1;
    piece.col = -1;
    saveGame();
}

function rotatePiece(pieceId) {
    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece) return;
    piece.rotation = (piece.rotation + 1) % 4;
    saveGame();
    renderTray();
    renderPieceBank();
}

function flipPiece(pieceId) {
    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece) return;
    piece.reflected = !piece.reflected;
    saveGame();
    renderTray();
    renderPieceBank();
}

function undo() {
    if (gameState.undoStack.length === 0) return;
    const a = gameState.undoStack.pop();
    const piece = gameState.pieces.find(p => p.id === a.pieceId);
    if (!piece) return;
    piece.row = a.prevRow; piece.col = a.prevCol;
    piece.rotation = a.prevRotation; piece.reflected = a.prevReflected;
    saveGame();
    renderTray();
    renderPieceBank();
}

function resetAll() {
    if (gameState.undoStack.length > 0 || gameState.pieces.some(p => p.row >= 0)) {
        if (!confirm(t('confirm_reset') || '确定要重置吗？')) return;
    }
    clearDragState();
    initPieces();
    saveGame();
    renderTray();
    renderPieceBank();
}

// ============================================================
// WIN DETECTION
// ============================================================
function getUncoveredValidCells() {
    const covered = Array.from({length:TRAY_ROWS}, () => Array(TRAY_COLS).fill(false));
    for (const piece of gameState.pieces) {
        if (piece.row < 0) continue;
        for (const c of getPieceCells(piece, piece.row, piece.col)) covered[c.row][c.col] = true;
    }
    const u = [];
    for (let r = 0; r < TRAY_ROWS; r++)
        for (let c = 0; c < TRAY_COLS; c++)
            if (!isBlocked(r, c) && !covered[r][c]) u.push({row:r, col:c, meta:CELL_META[r][c]});
    return u;
}

function getTodayTarget() {
    const now = new Date();
    const months = I18N_MONTHS[gameState.language];
    const weekdays = I18N_WEEKDAYS[gameState.language];
    return {
        targetMonth: months[now.getMonth()],
        targetDay: String(now.getDate()),
        targetWeekday: weekdays[now.getDay()],
    };
}

function checkWin() {
    const u = getUncoveredValidCells();
    if (u.length !== 3) return false;
    if (!gameState.pieces.every(p => p.row >= 0)) return false;
    const t = getTodayTarget();
    const labels = u.map(c => ({label:c.meta.label, type:c.meta.type}));
    return labels.some(l => l.type==='month' && l.label===t.targetMonth) &&
           labels.some(l => l.type==='day' && l.label===t.targetDay) &&
           labels.some(l => l.type==='weekday' && l.label===t.targetWeekday);
}

function handleWin() {
    const t = getTodayTarget();
    document.getElementById('win-date').textContent = `${t.targetMonth} ${t.targetDay} ${t.targetWeekday}`;
    document.getElementById('win-overlay').classList.remove('hidden');
    saveHistory(formatDateKey());
}

// ============================================================
// SAVE / LOAD
// ============================================================
function formatDateKey() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

const SK = 'puzzle_a_day_v3', HK = 'puzzle_a_day_hist_v3', TK = 'puzzle_a_day_cfg_v3';

function saveGame() {
    try { localStorage.setItem(SK, JSON.stringify({
        pieces: gameState.pieces.map(p => ({id:p.id,rotation:p.rotation,reflected:p.reflected,row:p.row,col:p.col})),
        date: formatDateKey(), ts: Date.now()
    })); } catch(e) {}
}

function loadGame() {
    try {
        const r = localStorage.getItem(SK);
        if (!r) return false;
        const d = JSON.parse(r);
        if (d.date !== formatDateKey()) return false;
        for (const s of d.pieces) {
            const p = gameState.pieces.find(x => x.id === s.id);
            if (p) { p.rotation=s.rotation; p.reflected=s.reflected; p.row=s.row; p.col=s.col; }
        }
        return true;
    } catch(e) { return false; }
}

function saveHistory(ds) {
    try {
        const r = localStorage.getItem(HK);
        const h = r ? JSON.parse(r) : {};
        const t = getTodayTarget();
        h[ds] = { month:t.targetMonth, day:t.targetDay, weekday:t.targetWeekday, ts:Date.now() };
        localStorage.setItem(HK, JSON.stringify(h));
    } catch(e) {}
}

function loadHistory() {
    try { const r = localStorage.getItem(HK); return r ? JSON.parse(r) : {}; }
    catch(e) { return {}; }
}

function loadSettings() {
    try {
        const r = localStorage.getItem(TK);
        if (!r) return;
        const s = JSON.parse(r);
        if (s.language) gameState.language = s.language;
        if (s.theme) gameState.theme = s.theme;
    } catch(e) {}
}

function saveSettings() {
    try { localStorage.setItem(TK, JSON.stringify({language:gameState.language, theme:gameState.theme})); }
    catch(e) {}
}

// ============================================================
// THEME
// ============================================================
function applyTheme() {
    document.body.classList.remove('dark','light');
    if (gameState.theme === 'dark') document.body.classList.add('dark');
    else if (gameState.theme === 'light') document.body.classList.add('light');
    const icon = document.getElementById('btn-theme');
    icon.textContent = isDark() ? '☀️' : '🌙';
}

function toggleTheme() {
    if (gameState.theme === 'auto') gameState.theme = 'dark';
    else if (gameState.theme === 'dark') gameState.theme = 'light';
    else gameState.theme = 'auto';
    applyTheme(); saveSettings();
    renderTray(); renderPieceBank();
}

function isDark() {
    return gameState.theme === 'dark' ||
        (gameState.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

// ============================================================
// CANVAS SETUP
// ============================================================
const canvas = document.getElementById('board-canvas');
const ctx = canvas.getContext('2d');

function calcCellSize() {
    const isLandscape = window.innerWidth > window.innerHeight;
    let cs;

    if (isLandscape) {
        // ---- Landscape: bank on the right ----
        // Width: tray shares space with bank. Estimate bank width from typical bcs~18.
        const estBankWidth = 8 * 18 + 48; // ~192px (2 wide pieces + padding)
        const availWidth = Math.min(window.innerWidth - 28, 900) - estBankWidth - 12;
        cs = Math.floor((availWidth - TRAY_PADDING * 2) / TRAY_COLS);

        // Height: bank doesn't sit below tray, so overhead is just fixed UI
        // App padding (~24) + header (~38) + date (~32) + controls (~40) + gaps (~30) ≈ 164
        const fixedOverhead = 180;
        const csFromHeight = Math.floor((window.innerHeight - fixedOverhead - TRAY_PADDING * 2) / TRAY_ROWS);
        cs = Math.min(cs, csFromHeight);

        cs = Math.max(cs, 20);
        cs = Math.min(cs, 60);
    } else {
        // ---- Portrait: bank below tray ----
        const mw = Math.min(window.innerWidth - 28, 520);
        cs = Math.floor((mw - TRAY_PADDING * 2) / TRAY_COLS);

        // Fixed overhead: app padding + header + date + tray pad + bank (~3 tray-cell units) + controls + gaps
        const fixedOverhead = 240;
        const cellUsage = TRAY_ROWS + 3;
        const csFromHeight = Math.floor((window.innerHeight - fixedOverhead - TRAY_PADDING * 2) / cellUsage);
        cs = Math.min(cs, csFromHeight);

        cs = Math.max(cs, 24);
        cs = Math.min(cs, 60);
    }

    gameState.cellSize = cs;

    // Set bank width — orientation-dependent so pieces don't overflow
    const bcs = bankCellSize();
    const bankEl = document.querySelector('.piece-bank');
    if (bankEl) {
        if (isLandscape) {
            // Narrow bank beside tray: at most 2 wide pieces per row
            bankEl.style.maxWidth = (2 * 4 * bcs + 48) + 'px';
        } else {
            // Portrait: bank spans full width, no max-width needed
            bankEl.style.maxWidth = '';
        }
    }
}

function canvasW() { return TRAY_COLS * gameState.cellSize + TRAY_PADDING * 2; }
function canvasH() { return TRAY_ROWS * gameState.cellSize + TRAY_PADDING * 2; }

function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvasW(), h = canvasH();
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

function cellX(c) { return TRAY_PADDING + c * gameState.cellSize; }
function cellY(r) { return TRAY_PADDING + r * gameState.cellSize; }
function bankCellSize() { return Math.max(13, Math.min(24, Math.round(gameState.cellSize * 0.45))); }

function getPieceColor(pid) {
    const colors = isDark() ? PIECE_COLORS_DARK : PIECE_COLORS;
    return colors[(pid - 1) % colors.length];
}

// ============================================================
// RENDERING: Continuous piece shape (NO per-cell strokes)
// ============================================================

// Create a compound path from piece cells. Uses plain rect so adjacent
// cells merge into a single seamless shape with no visible boundaries.
function createPiecePath(shape, ox, oy, cs) {
    const p = new Path2D();
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 1) continue;
            p.rect(ox + c * cs, oy + r * cs, cs, cs);
        }
    }
    return p;
}

// Draw a piece at pixel position (no grid snap) — used for drag clone
function drawPieceAt(shape, ox, oy, cs, color) {
    const path = createPiecePath(shape, ox, oy, cs);
    const b = getPiecePixelBounds({ baseShape: shape, rotation: 0, reflected: false }, ox, oy, cs);

    // Clip to piece shape for base fill + gradient
    ctx.save();
    ctx.clip(path);

    // Base color fill
    ctx.fillStyle = color;
    ctx.fillRect(b.x - 20, b.y - 20, b.w + 40, b.h + 40);

    // Bevel gradient across the piece (no per-cell visibility)
    const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    grad.addColorStop(0, 'rgba(255,255,255,0.3)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(b.x - 20, b.y - 20, b.w + 40, b.h + 40);

    ctx.restore();
}

// ============================================================
// TRAY RENDERING
// ============================================================
function getCSS(name, fb) {
    const v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fb;
}

function renderTray() {
    calcCellSize();
    setupCanvas();

    const cs = gameState.cellSize;
    const pad = TRAY_PADDING;
    const w = canvasW(), h = canvasH();
    const outerR = 22;
    const dark = isDark();

    const trayOuter = getCSS('--tray-outer', dark ? '#3d3050' : '#8b7355');
    const trayRecess = getCSS('--tray-recess', dark ? '#26243c' : '#f0e8d8');
    const textColor = getCSS('--text', dark ? '#e0dce8' : '#3d3226');

    ctx.clearRect(0, 0, w, h);

    // ---- Outer tray ----
    const trayGrad = ctx.createLinearGradient(0, 0, w, h);
    if (!dark) {
        trayGrad.addColorStop(0, '#9b8470'); trayGrad.addColorStop(0.5, trayOuter); trayGrad.addColorStop(1, '#7d6548');
    } else {
        trayGrad.addColorStop(0, '#4a3d60'); trayGrad.addColorStop(0.5, trayOuter); trayGrad.addColorStop(1, '#352848');
    }
    ctx.fillStyle = trayGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, outerR);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0.5, 0.5, w - 1, h - 1, outerR);
    ctx.stroke();

    // ---- Recessed area as a SINGLE merged surface (no per-cell gaps) ----
    // Build compound path of ALL valid cells
    const recessPath = new Path2D();
    for (let r = 0; r < TRAY_ROWS; r++) {
        for (let c = 0; c < TRAY_COLS; c++) {
            if (isBlocked(r, c)) continue;
            recessPath.rect(cellX(c), cellY(r), cs, cs);
        }
    }
    ctx.fillStyle = trayRecess;
    ctx.fill(recessPath);

    // ---- Edge shadows: where valid cells meet blocked cells ----
    for (let r = 0; r < TRAY_ROWS; r++) {
        for (let c = 0; c < TRAY_COLS; c++) {
            if (isBlocked(r, c)) continue;
            const x = cellX(c), y = cellY(r);
            // Top edge
            if (r === 0 || isBlocked(r-1, c)) {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(x, y, cs, 2);
            }
            // Bottom edge
            if (r === TRAY_ROWS-1 || isBlocked(r+1, c)) {
                ctx.fillStyle = 'rgba(0,0,0,0.06)';
                ctx.fillRect(x, y + cs - 2, cs, 2);
            }
            // Left edge
            if (c === 0 || isBlocked(r, c-1)) {
                ctx.fillStyle = 'rgba(0,0,0,0.08)';
                ctx.fillRect(x, y, 2, cs);
            }
            // Right edge
            if (c === TRAY_COLS-1 || isBlocked(r, c+1)) {
                ctx.fillStyle = 'rgba(0,0,0,0.04)';
                ctx.fillRect(x + cs - 2, y, 2, cs);
            }
        }
    }

    // ---- Cell labels ----
    for (let r = 0; r < TRAY_ROWS; r++) {
        for (let c = 0; c < TRAY_COLS; c++) {
            if (isBlocked(r, c)) continue;
            const meta = CELL_META[r]?.[c];
            if (!meta || !meta.label) continue;
            const cx = cellX(c) + cs / 2;
            const cy = cellY(r) + cs / 2;
            ctx.fillStyle = textColor;
            const fs = meta.type === 'month' ? Math.max(cs*0.22, 8) :
                      meta.type === 'weekday' ? Math.max(cs*0.19, 8) :
                      Math.max(cs*0.26, 9);
            ctx.font = `500 ${fs}px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let lbl = meta.label;
            const mw = cs - 6;
            while (ctx.measureText(lbl).width > mw && lbl.length > 1) lbl = lbl.slice(0, -1);
            ctx.fillText(lbl, cx, cy);
        }
    }

    // ---- Placed pieces ----
    for (const piece of gameState.pieces) {
        if (piece.row < 0) continue;
        // Skip the piece currently being dragged from tray
        if (gameState.dragFromTray && gameState.dragPieceId === piece.id && gameState.dragMoved) continue;
        const shape = getTransformedShape(piece);
        drawPieceAt(shape, cellX(piece.col), cellY(piece.row), cs, getPieceColor(piece.id));
    }

    updateTargetDisplay();
}

function updateTargetDisplay() {
    const t = getTodayTarget();
    const el = document.getElementById('target-date');
    const pc = gameState.pieces.filter(p => p.row >= 0).length;
    const uc = getUncoveredValidCells().length;
    const cOk = isDark() ? '#e0dce8' : '#3d3226';
    const cG = '#2ECC71', cB = '#E74C3C';
    el.innerHTML =
        `<span style="font-weight:700;">${t.targetMonth} · ${t.targetDay} · ${t.targetWeekday}</span>` +
        `<span style="margin:0 6px;color:var(--text-secondary);">|</span>` +
        `<span style="color:${pc===10?cG:cOk};font-size:0.82rem;">🧩 ${pc}/10</span>` +
        `<span style="margin:0 4px;color:var(--text-secondary);">·</span>` +
        `<span style="color:${uc===3?cG:uc<3?cB:cOk};font-size:0.82rem;">👁 ${uc}/3</span>`;
}

// ============================================================
// PIECE BANK (DOM)
// ============================================================
function renderPieceBank() {
    const list = document.getElementById('piece-list');
    list.innerHTML = '';

    const bcs = bankCellSize();

    for (const piece of gameState.pieces) {
        if (piece.row >= 0) continue; // placed pieces hidden

        const shape = getTransformedShape(piece);
        const rows = shape.length;
        const cols = shape[0]?.length || 0;

        const container = document.createElement('div');
        container.className = 'piece-item';
        container.dataset.pieceId = piece.id;
        container.style.touchAction = 'none';

        const pc = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        const pw = cols * bcs, ph = rows * bcs;
        pc.width = pw * dpr;
        pc.height = ph * dpr;
        pc.style.width = pw + 'px';
        pc.style.height = ph + 'px';
        pc.style.pointerEvents = 'none';

        const pctx = pc.getContext('2d');
        pctx.setTransform(1, 0, 0, 1, 0, 0);
        pctx.scale(dpr, dpr);

        const color = getPieceColor(piece.id);

        // Main shape path (merged cells, no internal boundaries)
        const mp = new Path2D();
        for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
                if (shape[r][c] === 1) mp.rect(c*bcs, r*bcs, bcs, bcs);

        pctx.save();
        pctx.clip(mp);
        pctx.fillStyle = color;
        const bx = 0, by = 0, bw = cols * bcs, bh = rows * bcs;
        pctx.fillRect(bx - 10, by - 10, bw + 20, bh + 20);
        const grad = pctx.createLinearGradient(bx, by, bx + bw, by + bh);
        grad.addColorStop(0, 'rgba(255,255,255,0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0.12)');
        pctx.fillStyle = grad;
        pctx.fillRect(bx - 10, by - 10, bw + 20, bh + 20);
        pctx.restore();

        container.appendChild(pc);

        // ---- Events ----
        container.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            handleBankPointerDown(e, piece.id, container);
        });
        container.addEventListener('pointermove', (e) => {
            if (gameState.dragPieceId !== piece.id) return;
            handleDragMove(e);
        });
        container.addEventListener('pointerup', (e) => {
            if (gameState.dragPieceId !== piece.id) return;
            handleDragUp(e, piece.id);
        });
        container.addEventListener('lostpointercapture', () => {
            if (gameState.dragPieceId === piece.id && gameState.clickTimer == null) {
                clearDragState();
                renderTray();
                renderPieceBank();
            }
        });

        list.appendChild(container);
    }

    if (list.children.length === 0) {
        const p = document.createElement('p');
        p.style.cssText = 'text-align:center;color:var(--text-secondary);padding:12px;font-size:0.85rem;';
        p.textContent = t('tray_empty');
        list.appendChild(p);
    }
}

// ============================================================
// INTERACTION: Bank pointer events
// ============================================================
function handleBankPointerDown(e, pieceId, container) {
    const now = Date.now();

    // If we have a pending click on a DIFFERENT piece, resolve it first
    if (gameState.clickTimer && gameState.clickPieceId != null && gameState.clickPieceId !== pieceId) {
        clearTimeout(gameState.clickTimer);
        gameState.clickTimer = null;
        rotatePiece(gameState.clickPieceId);
        gameState.clickPieceId = null;
        gameState.clickTime = 0;
    }

    // If actively dragging something else, ignore
    if (gameState.dragMoved && gameState.dragPieceId !== pieceId) return;

    // Double-click detection (same piece within 350ms)
    if (gameState.clickPieceId === pieceId && (now - gameState.clickTime) < 350 && !gameState.dragMoved) {
        if (gameState.clickTimer) { clearTimeout(gameState.clickTimer); gameState.clickTimer = null; }
        gameState.clickPieceId = null;
        gameState.clickTime = 0;
        clearDragState();
        flipPiece(pieceId);
        return;
    }

    // Start tracking
    gameState.dragPieceId = pieceId;
    gameState.dragFromTray = false;
    gameState.dragStartX = e.clientX;
    gameState.dragStartY = e.clientY;
    gameState.dragMoved = false;
    gameState.dragClientX = e.clientX;
    gameState.dragClientY = e.clientY;
    gameState.clickPieceId = pieceId;
    gameState.clickTime = now;
    gameState.dragBankContainer = container;

    // Calculate grab offset: where within the piece the user clicked
    // Bank piece is rendered at bankCellSize px per cell; drag clone uses tray cellSize
    const pieceCanvas = container.querySelector('canvas');
    const pieceRect = pieceCanvas.getBoundingClientRect();
    const bcs = bankCellSize();
    const scale = gameState.cellSize / bcs;
    gameState.dragGrabOffsetX = (e.clientX - pieceRect.left) * scale;
    gameState.dragGrabOffsetY = (e.clientY - pieceRect.top) * scale;

    container.setPointerCapture(e.pointerId);
}

function handleDragMove(e) {
    const dx = e.clientX - gameState.dragStartX;
    const dy = e.clientY - gameState.dragStartY;
    const dist = Math.abs(dx) + Math.abs(dy);

    if (dist > 5 && !gameState.dragMoved) {
        // Transition to drag mode
        gameState.dragMoved = true;
        // Cancel any pending click
        if (gameState.clickTimer) { clearTimeout(gameState.clickTimer); gameState.clickTimer = null; }
        gameState.clickPieceId = null;
        gameState.clickTime = 0;

        // If dragging from tray, remove piece from board
        if (gameState.dragFromTray) {
            removePieceFromBoard(gameState.dragPieceId);
            renderPieceBank();
        } else {
            // Dragging from bank: hide the piece in the bank
            if (gameState.dragBankContainer) {
                gameState.dragBankContainer.style.display = 'none';
            }
        }

        // Create floating clone that follows cursor
        createDragClone();
    }

    gameState.dragClientX = e.clientX;
    gameState.dragClientY = e.clientY;

    if (gameState.dragMoved) {
        updateDragClonePosition(e.clientX, e.clientY);
    }
}

function handleDragUp(e, pieceId) {
    if (gameState.dragMoved) {
        // Was a drag — try to place on tray
        tryDropOnTray();
    } else {
        // Was a click — schedule rotate (wait for possible double-click)
        gameState.clickPieceId = pieceId;
        gameState.clickTimer = setTimeout(() => {
            gameState.clickTimer = null;
            if (gameState.clickPieceId === pieceId && !gameState.dragMoved) {
                rotatePiece(pieceId);
                gameState.clickPieceId = null;
                gameState.clickTime = 0;
            }
            clearDragState();
        }, 280);
        return; // Don't clear drag state yet (waiting for double-click)
    }

    clearDragState();
    renderTray();
    renderPieceBank();
}

// ============================================================
// DRAG CLONE (floating element following cursor)
// ============================================================
function createDragClone() {
    if (dragClone) dragClone.remove();

    const piece = gameState.pieces.find(p => p.id === gameState.dragPieceId);
    if (!piece) return;

    const shape = getTransformedShape(piece);
    const cs = gameState.cellSize;
    const rows = shape.length;
    const cols = shape[0]?.length || 0;

    dragClone = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    dragClone.width = cols * cs * dpr;
    dragClone.height = rows * cs * dpr;
    dragClone.style.width = (cols * cs) + 'px';
    dragClone.style.height = (rows * cs) + 'px';
    dragClone.style.position = 'fixed';
    dragClone.style.pointerEvents = 'none';
    dragClone.style.zIndex = '1000';

    const dctx = dragClone.getContext('2d');
    dctx.setTransform(1, 0, 0, 1, 0, 0);
    dctx.scale(dpr, dpr);

    const color = getPieceColor(piece.id);

    // Main body (merged cells, no internal boundaries)
    const mp = new Path2D();
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (shape[r][c] === 1) mp.rect(c*cs, r*cs, cs, cs);

    dctx.save();
    dctx.clip(mp);
    dctx.fillStyle = color;
    dctx.fillRect(-10, -10, cols*cs + 20, rows*cs + 20);
    const grad = dctx.createLinearGradient(0, 0, cols*cs, rows*cs);
    grad.addColorStop(0, 'rgba(255,255,255,0.3)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    dctx.fillStyle = grad;
    dctx.fillRect(-10, -10, cols*cs + 20, rows*cs + 20);
    dctx.restore();

    document.body.appendChild(dragClone);
    updateDragClonePosition(gameState.dragClientX, gameState.dragClientY);
}

function updateDragClonePosition(cx, cy) {
    if (!dragClone) return;
    dragClone.style.left = (cx - gameState.dragGrabOffsetX) + 'px';
    dragClone.style.top = (cy - gameState.dragGrabOffsetY) + 'px';
}

function tryDropOnTray() {
    if (gameState.dragPieceId == null) return;

    const piece = gameState.pieces.find(p => p.id === gameState.dragPieceId);
    if (!piece) return;

    const rect = canvas.getBoundingClientRect();
    const cs = gameState.cellSize;

    // Piece top-left in canvas coords = cursor pos - grab offset
    const pieceLeft = (gameState.dragClientX - rect.left) - gameState.dragGrabOffsetX;
    const pieceTop = (gameState.dragClientY - rect.top) - gameState.dragGrabOffsetY;

    // Snap piece top-left to nearest grid cell
    const col = Math.round((pieceLeft - TRAY_PADDING) / cs);
    const row = Math.round((pieceTop - TRAY_PADDING) / cs);

    if (canPlace(piece, row, col, gameState.dragFromTray ? piece.id : undefined)) {
        placePieceOnBoard(piece.id, row, col);

        if (checkWin()) setTimeout(handleWin, 350);
    }
    // If placement invalid, piece stays where it was (in bank, or already removed from tray)
}

// ============================================================
// TRAY CANVAS EVENTS (pick up placed pieces by dragging)
// ============================================================
function findPieceAtCell(row, col) {
    if (isBlocked(row, col)) return null;
    for (let i = gameState.pieces.length - 1; i >= 0; i--) {
        const p = gameState.pieces[i];
        if (p.row < 0) continue;
        if (getPieceCells(p, p.row, p.col).some(c => c.row === row && c.col === col)) return p;
    }
    return null;
}

canvas.addEventListener('pointerdown', (e) => {
    // If already dragging from bank, ignore canvas events
    if (gameState.dragPieceId != null && !gameState.dragFromTray) return;
    if (gameState.dragMoved) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cs = gameState.cellSize;
    const col = Math.floor((px - TRAY_PADDING) / cs);
    const row = Math.floor((py - TRAY_PADDING) / cs);

    const placed = findPieceAtCell(row, col);
    if (!placed) return;

    e.preventDefault();

    // Start drag from tray
    gameState.dragPieceId = placed.id;
    gameState.dragFromTray = true;
    gameState.dragStartX = e.clientX;
    gameState.dragStartY = e.clientY;
    gameState.dragMoved = false;
    gameState.dragClientX = e.clientX;
    gameState.dragClientY = e.clientY;

    // Calculate grab offset: where within the piece the user clicked (canvas coords → piece-local coords)
    const canvasRect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - canvasRect.left;
    const canvasY = e.clientY - canvasRect.top;
    const piecePX = cellX(placed.col);
    const piecePY = cellY(placed.row);
    gameState.dragGrabOffsetX = canvasX - piecePX;
    gameState.dragGrabOffsetY = canvasY - piecePY;

    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
    if (!gameState.dragFromTray || gameState.dragPieceId == null) return;

    const dx = e.clientX - gameState.dragStartX;
    const dy = e.clientY - gameState.dragStartY;

    if (Math.abs(dx) + Math.abs(dy) > 5 && !gameState.dragMoved) {
        gameState.dragMoved = true;
        removePieceFromBoard(gameState.dragPieceId);
        // Don't render bank yet — piece follows cursor as floating clone.
        // Bank will be rebuilt on pointerup if the piece isn't placed back on tray.
        createDragClone();
    }

    gameState.dragClientX = e.clientX;
    gameState.dragClientY = e.clientY;

    if (gameState.dragMoved) {
        updateDragClonePosition(e.clientX, e.clientY);
    }
    renderTray();
});

canvas.addEventListener('pointerup', (e) => {
    if (!gameState.dragFromTray) return;
    if (gameState.dragPieceId == null) return;

    if (gameState.dragMoved) {
        tryDropOnTray();
    }
    // No movement = simple click on tray piece → do NOTHING (don't remove)

    clearDragState();
    renderTray();
    renderPieceBank();
});

canvas.addEventListener('lostpointercapture', () => {
    if (gameState.dragFromTray) {
        clearDragState();
        renderTray();
        renderPieceBank();
    }
});

// Prevent scroll on canvas touch
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });

// ============================================================
// UI & DIALOGS
// ============================================================
function setupUI() {
    document.getElementById('btn-reset').addEventListener('click', resetAll);
    document.getElementById('btn-undo').addEventListener('click', undo);
    document.getElementById('btn-theme').addEventListener('click', toggleTheme);
    document.getElementById('btn-lang').addEventListener('click', () => {
        document.getElementById('lang-overlay').classList.remove('hidden');
        renderLangList();
    });
    document.getElementById('btn-history').addEventListener('click', () => {
        document.getElementById('history-overlay').classList.remove('hidden');
        renderHistoryList();
    });
    document.getElementById('btn-close-win').addEventListener('click', () => {
        document.getElementById('win-overlay').classList.add('hidden');
    });
    document.getElementById('btn-close-history').addEventListener('click', () => {
        document.getElementById('history-overlay').classList.add('hidden');
    });
    document.getElementById('btn-close-lang').addEventListener('click', () => {
        document.getElementById('lang-overlay').classList.add('hidden');
    });
    document.querySelectorAll('.overlay').forEach(ov => {
        ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.add('hidden'); });
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearDragState();
            renderTray();
            renderPieceBank();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault(); undo();
        }
    });

    // Theme change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (gameState.theme === 'auto') { applyTheme(); renderTray(); renderPieceBank(); }
    });

    // Resize
    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { renderTray(); renderPieceBank(); }, 150);
    });
}

function renderLangList() {
    const list = document.getElementById('lang-list');
    list.innerHTML = '';
    LANGUAGES.forEach(l => {
        const btn = document.createElement('button');
        btn.className = 'lang-btn';
        if (l.code === gameState.language) btn.classList.add('active');
        btn.textContent = l.nativeName;
        btn.addEventListener('click', () => setLanguage(l.code));
        list.appendChild(btn);
    });
}

function setLanguage(code) {
    gameState.language = code;
    buildCellMeta(code);
    saveSettings();
    updateAllI18n();
    renderTray();
    renderPieceBank();
    document.getElementById('lang-overlay').classList.add('hidden');
}

function renderHistoryList() {
    const list = document.getElementById('history-list');
    const history = loadHistory();
    const entries = Object.entries(history).sort((a, b) => b[0].localeCompare(a[0]));
    if (entries.length === 0) {
        list.innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:20px;">${t('no_history')}</p>`;
        return;
    }
    list.innerHTML = entries.map(([date, data]) => `
        <div class="history-item">
            <span class="date">${date}</span>
            <span class="target-exposed">${t('exposed')}: ${data.month} · ${data.day} · ${data.weekday}</span>
        </div>
    `).join('');
}

// ============================================================
// INIT
// ============================================================
function init() {
    loadSettings();
    buildCellMeta(gameState.language);
    applyTheme();
    initPieces();

    const loaded = loadGame();

    renderTray();
    renderPieceBank();
    updateAllI18n();
    updateTargetDisplay();
    setupUI();

    if (loaded && checkWin()) setTimeout(handleWin, 500);

    console.log('🧩 A Puzzle A Day v3 ready!');
    console.log(`   Today: ${getTodayTarget().targetMonth} ${getTodayTarget().targetDay} ${getTodayTarget().targetWeekday}`);
    console.log('   Drag pieces into tray | Click = rotate | Double-click = flip');
}

document.addEventListener('DOMContentLoaded', init);
