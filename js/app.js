// ============================================================
// A Puzzle A Day - Complete Game Engine v4
// ============================================================

// ============================================================
// DATA: Piece Definitions
// ============================================================
const PIECE_DEFS = [
    { id: 1, shape: [[1, 1, 1, 1]] },
    { id: 2, shape: [[1, 1, 1, 1], [1, 0, 0, 0]] },
    { id: 3, shape: [[1, 1, 1, 1], [0, 0, 1, 0]] },
    { id: 4, shape: [[0, 0, 1, 1], [1, 1, 1, 0]] },
    { id: 5, shape: [[1, 1, 1], [1, 1, 1]] },
    { id: 6, shape: [[1, 1, 1], [0, 1, 1]] },
    { id: 7, shape: [[1, 1, 1], [1, 0, 1]] },
    { id: 8, shape: [[1, 1, 1], [1, 0, 0]] },
    { id: 9, shape: [[1, 1, 1], [0, 1, 0]] },
    { id: 10, shape: [[0, 1, 1], [1, 1, 0]] },
    { id: 11, shape: [[1, 1], [1, 1]] },
    { id: 12, shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
    { id: 13, shape: [[1, 1, 1], [0, 1, 0], [0, 1, 0]] },
    { id: 14, shape: [[1, 1, 0], [0, 1, 0], [0, 1, 1]] },
];

const PIECE_COLORS = [
    '#E85D4E', '#4A9FE8', '#3ECB7B', '#F5A040', '#9B6FC0',
    '#1EC0A8', '#E88040', '#E85578', '#10B8CC', '#8EC850', '#D4789E', '#7EB8DA', '#C4A45A', '#6DBE6D'
];

const PIECE_COLORS_DARK = [
    '#F07070', '#60B0E0', '#50E090', '#F5B840', '#B880D0',
    '#40D0B8', '#F09050', '#F05080', '#30D8F0', '#A0D860', '#E090B0', '#90C8EA', '#D4B86A', '#80D080'
];

// Lighten / darken a hex color, for piece bevel gradients (same approach as tray)
function lighter(hex, amt) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.round(r + (255 - r) * amt);
    const lg = Math.round(g + (255 - g) * amt);
    const lb = Math.round(b + (255 - b) * amt);
    return `rgb(${lr},${lg},${lb})`;
}
function darker(hex, amt) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const dr = Math.round(r * (1 - amt));
    const dg = Math.round(g * (1 - amt));
    const db = Math.round(b * (1 - amt));
    return `rgb(${dr},${dg},${db})`;
}

// ============================================================
// DATA: Puzzle Variants & Tray Layouts
// ============================================================
const TRAY_CONFIGS = {
    'full': {
        blocked: ['0,6','1,6','7,0','7,1','7,2','7,3'],
        hasWeekdays: true,
    },
    'no-weekdays': {
        blocked: ['0,6','1,6','6,3','6,4','6,5','6,6','7,0','7,1','7,2','7,3','7,4','7,5','7,6'],
        hasWeekdays: false,
    },
    'no-weekdays-alt': {
        blocked: ['0,6','1,6','6,0','6,1','6,2','6,3','7,0','7,1','7,2','7,3','7,4','7,5','7,6'],
        hasWeekdays: false,
    },
};

const VARIANTS = [
    { id: 'dragonfjord',  nameKey: 'var_dragonfjord',  trayType: 'no-weekdays',     pieceIds: [2,3,4,5,6,7,12,14] },
    { id: 'jarringwords', nameKey: 'var_jarringwords', trayType: 'no-weekdays',     pieceIds: [2,3,4,5,6,7,12,13] },
    { id: 'therammer',    nameKey: 'var_therammer',    trayType: 'no-weekdays-alt', pieceIds: [1,5,6,7,8,9,10,11,12] },
    { id: 'weekday',      nameKey: 'var_weekday',      trayType: 'full',            pieceIds: [1,2,4,6,7,8,10,12,13,14] },
];

function getVariant() {
    return VARIANTS.find(v => v.id === gameState.variant) || VARIANTS[0];
}

// ============================================================
// DATA: Tray
// ============================================================
const TRAY_COLS = 7;
const TRAY_ROWS = 8;
const TRAY_PADDING = 18;

let _blockedCells = new Set();

const CELL_META = [];

function buildCellMeta(lang, trayType) {
    const config = TRAY_CONFIGS[trayType] || TRAY_CONFIGS['full'];
    const months = I18N_MONTHS[lang];
    const weekdays = I18N_WEEKDAYS[lang];

    // Rebuild the dynamic blocked set from tray config
    _blockedCells = new Set(config.blocked);

    for (let r = 0; r < TRAY_ROWS; r++) {
        CELL_META[r] = [];
        for (let c = 0; c < TRAY_COLS; c++) {
            const key = `${r},${c}`;
            if (_blockedCells.has(key)) {
                CELL_META[r][c] = { label: '', type: 'blocked' };
            } else if (r === 0) {
                CELL_META[r][c] = { label: months[c], type: 'month' };
            } else if (r === 1) {
                CELL_META[r][c] = { label: months[6 + c], type: 'month' };
            } else if (r >= 2 && r <= 6 && trayType !== 'no-weekdays-alt') {
                // Standard day layout: left-to-right fill
                const dayNum = (r - 2) * 7 + c + 1;
                if (dayNum <= 31) {
                    CELL_META[r][c] = { label: String(dayNum), type: 'day' };
                } else if (config.hasWeekdays) {
                    CELL_META[r][c] = { label: weekdays[c - 3], type: 'weekday' };
                }
            } else if (r >= 2 && r <= 6 && trayType === 'no-weekdays-alt') {
                // Custom: days 1-28 standard, 29-31 at row 6 cols 4-6
                if (r < 6) {
                    const dayNum = (r - 2) * 7 + c + 1;
                    if (dayNum <= 28) {
                        CELL_META[r][c] = { label: String(dayNum), type: 'day' };
                    }
                } else if (r === 6 && c >= 4) {
                    const dayNum = 29 + (c - 4);  // col 4=29, 5=30, 6=31
                    CELL_META[r][c] = { label: String(dayNum), type: 'day' };
                }
            } else if (r === 7 && config.hasWeekdays) {
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
    'ru': ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
    'fr': ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'],
    'de': ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
    'it': ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],
    'hu': ['Jan','Feb','Már','Ápr','Máj','Jún','Júl','Aug','Szep','Okt','Nov','Dec'],
};

const I18N_WEEKDAYS = {
    'zh-CN': ['周日','周一','周二','周三','周四','周五','周六'],
    'en': ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    'ja': ['日曜','月曜','火曜','水曜','木曜','金曜','土曜'],
    'ko': ['일요','월요','화요','수요','목요','금요','토요'],
    'ru': ['Вск','Пнд','Втр','Срд','Чтв','Птн','Сбт'],
    'fr': ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
    'de': ['Son','Mon','Die','Mit','Don','Fre','Sam'],
    'it': ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
    'hu': ['Vas','Hét','Ked','Sze','Csü','Pén','Szo'],
};

const TRANSLATIONS = {
    'zh-CN': {
        title:'A Puzzle A Day', today:'今日目标',
        reset:'重置', undo:'撤销', close:'关闭',
        congrats:'🎉 恭喜！', solved:'你完成了今天的拼图！',
        history:'拼图历史', select_lang:'选择语言',
        no_history:'还没有完成记录，快来挑战今天的拼图吧！',
        exposed:'露出', confirm_reset:'确定要重置吗？所有进度将丢失。',
        drag_hint:'拖入托盘 | 单击翻转 | 双击旋转',
        tray_empty:'所有方块已放入托盘 ✓',
        return_to_today:'返回今天',
        cal_weekdays:['日','一','二','三','四','五','六'],
        no_pieces_data:'该记录不包含拼图数据，无法恢复',
        viewing_past:'查看历史: ',
        select_variant:'选择拼图',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'跟随系统',
        theme_auto:'主题：自动',
        theme_light:'主题：浅色',
        theme_dark:'主题：深色',
        help_title:'游戏帮助',
        help_controls_title:'操作方式',
        help_ctrl_drag:'拖拽方块到托盘',
        help_ctrl_rotate:'双击方块旋转',
        help_ctrl_flip:'单击方块翻转',
        help_ctrl_return:'从托盘拖回方块到待选区',
        help_goal_title:'胜利条件',
        help_goal:'用所有方块填满托盘，仅露出今日的月份、日期（和对应变体的星期）。',
        help_footer_prefix:'由 DeepSeek V4 Pro 生成，设计来自',
    },
    'en': {
        title:'A Puzzle A Day', today:'Today\'s Target',
        reset:'Reset', undo:'Undo', close:'Close',
        congrats:'🎉 Congratulations!', solved:'You solved today\'s puzzle!',
        history:'Puzzle History', select_lang:'Select Language',
        no_history:'No records yet. Solve today\'s puzzle!',
        exposed:'Exposed', confirm_reset:'Are you sure? All progress will be lost.',
        drag_hint:'Drag to board | Click to flip | Double-click to rotate',
        tray_empty:'All pieces placed ✓',
        return_to_today:'Return to Today',
        cal_weekdays:['Su','Mo','Tu','We','Th','Fr','Sa'],
        no_pieces_data:'This entry has no puzzle data to restore',
        viewing_past:'Viewing: ',
        select_variant:'Select Puzzle',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'Follow System',
        theme_auto:'Theme: Auto',
        theme_light:'Theme: Light',
        theme_dark:'Theme: Dark',
        help_title:'How to Play',
        help_controls_title:'Controls',
        help_ctrl_drag:'Drag a piece onto the tray',
        help_ctrl_rotate:'Double-click a piece to rotate',
        help_ctrl_flip:'Click a piece to flip',
        help_ctrl_return:'Drag a piece from the tray back to the bank',
        help_goal_title:'Goal',
        help_goal:'Fill the tray with all pieces so that only today\'s month, day (and weekday for applicable variants) remain visible.',
        help_footer_prefix:'Generated by DeepSeek V4 Pro, designed by',
    },
    'ja': {
        title:'A Puzzle A Day', today:'今日の目標',
        reset:'リセット', undo:'元に戻す', close:'閉じる',
        congrats:'🎉 おめでとう！', solved:'今日のパズルを解きました！',
        history:'パズル履歴', select_lang:'言語選択',
        no_history:'まだ記録がありません。今日のパズルに挑戦しましょう！',
        exposed:'露出', confirm_reset:'リセットしますか？すべての進行状況が失われます。',
        drag_hint:'ドラッグで配置 | クリックで反転 | ダブルクリックで回転',
        tray_empty:'すべてのピースが配置されました ✓',
        return_to_today:'今日に戻る',
        cal_weekdays:['日','月','火','水','木','金','土'],
        no_pieces_data:'この記録にはパズルデータがありません',
        viewing_past:'履歴表示: ',
        select_variant:'パズル選択',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'システムに従う',
        theme_auto:'テーマ：自動',
        theme_light:'テーマ：ライト',
        theme_dark:'テーマ：ダーク',
        help_title:'遊び方',
        help_controls_title:'操作方法',
        help_ctrl_drag:'ピースをトレイにドラッグ',
        help_ctrl_rotate:'ダブルクリックで回転',
        help_ctrl_flip:'クリックで反転',
        help_ctrl_return:'トレイからピースをバンクに戻す',
        help_goal_title:'勝利条件',
        help_goal:'すべてのピースを配置し、今日の月・日（および対応バリアントでは曜日）だけが見える状態にします。',
        help_footer_prefix:'Generated by DeepSeek V4 Pro, designed by',
    },
    'ko': {
        title:'A Puzzle A Day', today:'오늘의 목표',
        reset:'초기화', undo:'되돌리기', close:'닫기',
        congrats:'🎉 축하합니다!', solved:'오늘의 퍼즐을 풀었습니다!',
        history:'퍼즐 기록', select_lang:'언어 선택',
        no_history:'아직 기록이 없습니다. 오늘의 퍼즐에 도전하세요!',
        exposed:'노출', confirm_reset:'초기화하시겠습니까? 모든 진행 상황이 손실됩니다.',
        drag_hint:'드래그하여 배치 | 클릭 뒤집기 | 더블클릭 회전',
        tray_empty:'모든 조각이 배치되었습니다 ✓',
        return_to_today:'오늘로 돌아가기',
        cal_weekdays:['일','월','화','수','목','금','토'],
        no_pieces_data:'이 기록에는 퍼즐 데이터가 없습니다',
        viewing_past:'기록 보기: ',
        select_variant:'퍼즐 선택',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'시스템 따르기',
        theme_auto:'테마: 자동',
        theme_light:'테마: 라이트',
        theme_dark:'테마: 다크',
        help_title:'게임 도움말',
        help_controls_title:'조작 방법',
        help_ctrl_drag:'조각을 트레이에 드래그',
        help_ctrl_rotate:'더블클릭하여 회전',
        help_ctrl_flip:'클릭하여 뒤집기',
        help_ctrl_return:'트레이에서 조각을 다시 뱅크로 드래그',
        help_goal_title:'승리 조건',
        help_goal:'모든 조각을 배치하여 오늘의 월, 일(및 해당 변형의 경우 요일)만 보이도록 합니다.',
        help_footer_prefix:'Generated by DeepSeek V4 Pro, designed by',
    },
    'ru': {
        title:'A Puzzle A Day', today:'Сегодня',
        reset:'Сброс', undo:'Отмена', close:'Закрыть',
        congrats:'🎉 Поздравляем!', solved:'Вы решили сегодняшнюю головоломку!',
        history:'История', select_lang:'Выбор языка',
        no_history:'Нет записей. Решите сегодняшнюю головоломку!',
        exposed:'Открыто', confirm_reset:'Вы уверены? Весь прогресс будет потерян.',
        drag_hint:'Перетащите на доску | Нажмите для отражения | Двойной клик для поворота',
        tray_empty:'Все фигуры размещены ✓',
        return_to_today:'Вернуться к сегодня',
        cal_weekdays:['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
        no_pieces_data:'В этой записи нет данных',
        viewing_past:'Просмотр: ',
        select_variant:'Выбрать вариант',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'Как в системе',
        theme_auto:'Тема: Авто',
        theme_light:'Тема: Светлая',
        theme_dark:'Тема: Тёмная',
        help_title:'Как играть',
        help_controls_title:'Управление',
        help_ctrl_drag:'Перетащите фигуру на поддон',
        help_ctrl_rotate:'Двойной клик для поворота',
        help_ctrl_flip:'Нажмите для отражения',
        help_ctrl_return:'Перетащите фигуру с поддона обратно',
        help_goal_title:'Цель',
        help_goal:'Заполните поддон так, чтобы видны были только сегодняшние месяц, число (и день недели для соответствующих вариантов).',
        help_footer_prefix:'Создано DeepSeek V4 Pro, дизайн от',
    },
    'fr': {
        title:'A Puzzle A Day', today:'Aujourd\'hui',
        reset:'Réinitialiser', undo:'Annuler', close:'Fermer',
        congrats:'🎉 Félicitations !', solved:'Vous avez résolu le puzzle du jour !',
        history:'Historique', select_lang:'Choisir la langue',
        no_history:'Pas encore d\'enregistrement. Résolvez le puzzle du jour !',
        exposed:'Exposé', confirm_reset:'Êtes-vous sûr ? Tout progrès sera perdu.',
        drag_hint:'Glissez sur le plateau | Clic pour retourner | Double-clic pour pivoter',
        tray_empty:'Toutes les pièces placées ✓',
        return_to_today:'Revenir à aujourd\'hui',
        cal_weekdays:['Di','Lu','Ma','Me','Je','Ve','Sa'],
        no_pieces_data:'Cette entrée n\'a pas de données',
        viewing_past:'Affichage : ',
        select_variant:'Choisir le puzzle',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'Suivre le système',
        theme_auto:'Thème : Auto',
        theme_light:'Thème : Clair',
        theme_dark:'Thème : Sombre',
        help_title:'Comment jouer',
        help_controls_title:'Contrôles',
        help_ctrl_drag:'Glissez une pièce sur le plateau',
        help_ctrl_rotate:'Double-cliquez pour pivoter',
        help_ctrl_flip:'Cliquez sur une pièce pour retourner',
        help_ctrl_return:'Retirez une pièce du plateau vers la réserve',
        help_goal_title:'Objectif',
        help_goal:'Remplissez le plateau avec toutes les pièces de sorte que seuls le mois, le jour (et le jour de la semaine pour les variantes applicables) d\'aujourd\'hui restent visibles.',
        help_footer_prefix:'Généré par DeepSeek V4 Pro, conçu par',
    },
    'de': {
        title:'A Puzzle A Day', today:'Heutiges Ziel',
        reset:'Zurücksetzen', undo:'Rückgängig', close:'Schließen',
        congrats:'🎉 Glückwunsch!', solved:'Du hast das heutige Puzzle gelöst!',
        history:'Verlauf', select_lang:'Sprache wählen',
        no_history:'Noch keine Einträge. Löse das heutige Puzzle!',
        exposed:'Sichtbar', confirm_reset:'Bist du sicher? Alle Fortschritte gehen verloren.',
        drag_hint:'Ziehen zum Platzieren | Klick zum Spiegeln | Doppelklick zum Drehen',
        tray_empty:'Alle Teile platziert ✓',
        return_to_today:'Zurück zu heute',
        cal_weekdays:['So','Mo','Di','Mi','Do','Fr','Sa'],
        no_pieces_data:'Dieser Eintrag hat keine Puzzle-Daten',
        viewing_past:'Ansicht: ',
        select_variant:'Puzzle wählen',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'System folgen',
        theme_auto:'Theme: Auto',
        theme_light:'Theme: Hell',
        theme_dark:'Theme: Dunkel',
        help_title:'Spielanleitung',
        help_controls_title:'Steuerung',
        help_ctrl_drag:'Ziehe ein Teil auf das Tablett',
        help_ctrl_rotate:'Doppelklicke zum Drehen',
        help_ctrl_flip:'Klicke zum Spiegeln',
        help_ctrl_return:'Ziehe ein Teil vom Tablett zurück',
        help_goal_title:'Ziel',
        help_goal:'Fülle das Tablett so, dass nur der heutige Monat, Tag (und Wochentag für entsprechende Varianten) sichtbar bleiben.',
        help_footer_prefix:'Erstellt von DeepSeek V4 Pro, Design von',
    },
    'it': {
        title:'A Puzzle A Day', today:'Obiettivo di oggi',
        reset:'Ripristina', undo:'Annulla', close:'Chiudi',
        congrats:'🎉 Congratulazioni!', solved:'Hai risolto il puzzle di oggi!',
        history:'Cronologia', select_lang:'Seleziona lingua',
        no_history:'Nessun record. Risolvi il puzzle di oggi!',
        exposed:'Esposto', confirm_reset:'Sei sicuro? Tutti i progressi andranno persi.',
        drag_hint:'Trascina sul vassoio | Clic per capovolgere | Doppio clic per ruotare',
        tray_empty:'Tutti i pezzi posizionati ✓',
        return_to_today:'Torna ad oggi',
        cal_weekdays:['Do','Lu','Ma','Me','Gi','Ve','Sa'],
        no_pieces_data:'Questa voce non ha dati del puzzle',
        viewing_past:'Visualizzazione: ',
        select_variant:'Seleziona puzzle',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'Segui sistema',
        theme_auto:'Tema: Auto',
        theme_light:'Tema: Chiaro',
        theme_dark:'Tema: Scuro',
        help_title:'Come giocare',
        help_controls_title:'Controlli',
        help_ctrl_drag:'Trascina un pezzo sul vassoio',
        help_ctrl_rotate:'Doppio clic per ruotare',
        help_ctrl_flip:'Clicca un pezzo per capovolgere',
        help_ctrl_return:'Trascina un pezzo dal vassoio alla riserva',
        help_goal_title:'Obiettivo',
        help_goal:'Riempi il vassoio con tutti i pezzi in modo che solo il mese, il giorno (e il giorno della settimana per le varianti applicabili) di oggi rimangano visibili.',
        help_footer_prefix:'Generato da DeepSeek V4 Pro, design di',
    },
    'hu': {
        title:'A Puzzle A Day', today:'Mai cél',
        reset:'Visszaállítás', undo:'Visszavonás', close:'Bezárás',
        congrats:'🎉 Gratulálunk!', solved:'Megoldottad a mai feladványt!',
        history:'Előzmények', select_lang:'Nyelv kiválasztása',
        no_history:'Még nincs bejegyzés. Oldd meg a mai feladványt!',
        exposed:'Látható', confirm_reset:'Biztos vagy benne? Minden haladás elveszik.',
        drag_hint:'Húzd a táblára | Kattints a tükrözéshez | Dupla kattintás a forgatáshoz',
        tray_empty:'Minden elem elhelyezve ✓',
        return_to_today:'Vissza a maihoz',
        cal_weekdays:['V','H','K','Sze','Cs','P','Szo'],
        no_pieces_data:'Ennek a bejegyzésnek nincs feladvány adata',
        viewing_past:'Megtekintés: ',
        select_variant:'Feladvány választása',
        var_dragonfjord:'DragonFjord\'s A-Puzzle-A-Day',
        var_jarringwords:'JarringWords\'s Calendar Puzzle',
        var_therammer:'TheRammer Puzzle Calendar',
        var_weekday:'WeekDay Calendar Puzzle',
        var_dragonfjord_short:'DragonFjord',
        var_jarringwords_short:'JarringWords',
        var_therammer_short:'TheRammer',
        var_weekday_short:'WeekDay',
        lang_auto:'Rendszer követése',
        theme_auto:'Téma: Auto',
        theme_light:'Téma: Világos',
        theme_dark:'Téma: Sötét',
        help_title:'Játék útmutató',
        help_controls_title:'Kezelés',
        help_ctrl_drag:'Húzz egy elemet a tálcára',
        help_ctrl_rotate:'Dupla kattintás a forgatáshoz',
        help_ctrl_flip:'Kattints egy elemre a tükrözéshez',
        help_ctrl_return:'Húzz egy elemet a tálcáról vissza a készletbe',
        help_goal_title:'Cél',
        help_goal:'Töltsd meg a tálcát az összes elemmel úgy, hogy csak a mai hónap, nap (és a megfelelő változatoknál a hét napja) maradjon látható.',
        help_footer_prefix:'Készítette: DeepSeek V4 Pro, tervezte:',
    },
};

const LANGUAGES = [
    { code:'zh-CN', name:'中文', nativeName:'中文 (Simplified Chinese)' },
    { code:'en', name:'English', nativeName:'English' },
    { code:'ja', name:'日本語', nativeName:'日本語 (Japanese)' },
    { code:'ko', name:'한국어', nativeName:'한국어 (Korean)' },
    { code:'ru', name:'Русский', nativeName:'Русский (Russian)' },
    { code:'fr', name:'Français', nativeName:'Français (French)' },
    { code:'de', name:'Deutsch', nativeName:'Deutsch (German)' },
    { code:'it', name:'Italiano', nativeName:'Italiano (Italian)' },
    { code:'hu', name:'Magyar', nativeName:'Magyar (Hungarian)' },
];

function detectSystemLanguage() {
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.startsWith('zh')) return 'zh-CN';
    if (nav.startsWith('ja')) return 'ja';
    if (nav.startsWith('ko')) return 'ko';
    if (nav.startsWith('ru')) return 'ru';
    if (nav.startsWith('fr')) return 'fr';
    if (nav.startsWith('de')) return 'de';
    if (nav.startsWith('it')) return 'it';
    if (nav.startsWith('hu')) return 'hu';
    return 'en';
}

function resolvedLanguage() {
    if (gameState.language === 'auto') return detectSystemLanguage();
    return gameState.language;
}

function t(key, params) {
    let text = TRANSLATIONS[resolvedLanguage()]?.[key] || TRANSLATIONS['en'][key] || key;
    if (params) for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, v);
    return text;
}

function updateAllI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
}

function updateTitle() {
    const variant = getVariant();
    const isLandscape = window.innerWidth > window.innerHeight;
    const key = isLandscape ? variant.nameKey : (variant.nameKey + '_short');
    const titleEl = document.getElementById('variant-title');
    if (titleEl) titleEl.textContent = t(key);
}

// ============================================================
// STATE
// ============================================================
const gameState = {
    variant: 'dragonfjord',
    pieces: [],
    cellSize: 52,
    language: 'zh-CN',
    theme: 'auto',
    viewingDate: null,                              // null=today, "YYYY-MM-DD"=viewing past
    calendarYear: new Date().getFullYear(),          // calendar dialog current year
    calendarMonth: new Date().getMonth(),            // calendar dialog current month (0-based)
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
    const variant = getVariant();
    gameState.pieces = PIECE_DEFS
        .filter(def => variant.pieceIds.includes(def.id))
        .map(def => ({
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
    return _blockedCells.has(`${row},${col}`);
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

// Check whether a piece would overlap blocked cells or other pieces
// if transformed with the given rotation, reflection, and position.
function wouldOverlap(piece, newRotation, newReflected, newRow, newCol) {
    // Build a temporary piece-like object with the hypothetical transform
    const temp = { baseShape: piece.baseShape, rotation: newRotation, reflected: newReflected };
    const cells = getPieceCells(temp, newRow, newCol);
    for (const cell of cells) {
        if (cell.row < 0 || cell.row >= TRAY_ROWS || cell.col < 0 || cell.col >= TRAY_COLS) return true;
        if (isBlocked(cell.row, cell.col)) return true;
        for (const other of gameState.pieces) {
            if (other.id === piece.id) continue;
            if (other.row < 0) continue;
            const oc = getPieceCells(other, other.row, other.col);
            if (oc.some(o => o.row === cell.row && o.col === cell.col)) return true;
        }
    }
    return false;
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
    // If on tray, check that flipped piece won't overlap blocked cells or other pieces
    if (piece.row >= 0) {
        if (wouldOverlap(piece, piece.rotation, !piece.reflected, piece.row, piece.col)) return;
    }
    piece.reflected = !piece.reflected;
    saveGame();
    renderTray();
    renderPieceBank();
}

// Rotate a piece 90° CW, pivoting around a specific tray cell.
// pivotRow/pivotCol: the tray cell the user clicked on (must be part of the piece).
// For pieces in the bank, use standard rotatePiece() instead.
function rotatePieceAt(pieceId, pivotRow, pivotCol) {
    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece || piece.row < 0) return;

    const shape = getTransformedShape(piece);
    const localR = pivotRow - piece.row;
    const localC = pivotCol - piece.col;

    // Guard: the clicked cell must actually belong to this piece
    if (localR < 0 || localR >= shape.length || localC < 0 || localC >= shape[0].length) return;
    if (shape[localR][localC] !== 1) return;

    const newRotation = (piece.rotation + 1) % 4;
    // After 90° CW rotation, the cell at (localR, localC) in the old shape
    // moves to (localC, oldRows - 1 - localR) in the new shape.
    // Keep that cell at the same tray position (pivotRow, pivotCol):
    const newRow = pivotRow - localC;
    const newCol = pivotCol - shape.length + 1 + localR;

    if (wouldOverlap(piece, newRotation, piece.reflected, newRow, newCol)) return;

    piece.rotation = newRotation;
    piece.row = newRow;
    piece.col = newCol;
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
    gameState.viewingDate = null;
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

function getTodayTarget(dateOrStr) {
    let d;
    if (dateOrStr instanceof Date) {
        d = dateOrStr;
    } else if (typeof dateOrStr === 'string') {
        const p = parseDateKey(dateOrStr);
        d = new Date(p.year, p.month, p.day);
    } else {
        d = new Date();
    }
    const months = I18N_MONTHS[resolvedLanguage()];
    const weekdays = I18N_WEEKDAYS[resolvedLanguage()];
    return {
        targetMonth: months[d.getMonth()],
        targetDay: String(d.getDate()),
        targetWeekday: weekdays[d.getDay()],
    };
}

function checkWin() {
    const u = getUncoveredValidCells();
    if (!gameState.pieces.every(p => p.row >= 0)) return false;
    const t = getTodayTarget();
    const labels = u.map(c => ({label:c.meta.label, type:c.meta.type}));
    const config = TRAY_CONFIGS[getVariant().trayType];
    if (!labels.some(l => l.type==='month' && l.label===t.targetMonth)) return false;
    if (!labels.some(l => l.type==='day' && l.label===t.targetDay)) return false;
    if (config.hasWeekdays && !labels.some(l => l.type==='weekday' && l.label===t.targetWeekday)) return false;
    return true;
}

function handleWin() {
    const t = getTodayTarget();
    const config = TRAY_CONFIGS[getVariant().trayType];
    if (config.hasWeekdays) {
        document.getElementById('win-date').textContent = `${t.targetMonth} ${t.targetDay} ${t.targetWeekday}`;
    } else {
        document.getElementById('win-date').textContent = `${t.targetMonth} ${t.targetDay}`;
    }
    document.getElementById('win-overlay').classList.remove('hidden');
    if (!gameState.viewingDate) saveHistory(formatDateKey());
}

// ============================================================
// SAVE / LOAD
// ============================================================
function formatDateKey(date) {
    const d = date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function parseDateKey(ds) {
    const parts = ds.split('-');
    return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1, day: parseInt(parts[2]) };
}

const SK_OLD = 'puzzle_a_day_v3', HK_OLD = 'puzzle_a_day_hist_v3', TK_OLD = 'puzzle_a_day_cfg_v3';
const TK = 'puzzle_a_day_cfg_v4';

function storeKey() { return `puzzle_a_day_v4_${gameState.variant}`; }
function historyKey() { return `puzzle_a_day_hist_v4_${gameState.variant}`; }

function saveGame() {
    try { localStorage.setItem(storeKey(), JSON.stringify({
        pieces: gameState.pieces.map(p => ({id:p.id,rotation:p.rotation,reflected:p.reflected,row:p.row,col:p.col})),
        date: formatDateKey()
    })); } catch(e) {}
}

function loadGame() {
    try {
        let r = localStorage.getItem(storeKey());
        // Fallback: try v3 key for first-time migration
        if (!r && gameState.variant === 'dragonfjord') r = localStorage.getItem(SK_OLD);
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
        const r = localStorage.getItem(historyKey());
        const h = r ? JSON.parse(r) : {};
        // Fallback: migrate old v3 history on first save
        if (Object.keys(h).length === 0 && gameState.variant === 'dragonfjord') {
            const old = localStorage.getItem(HK_OLD);
            if (old) { try { Object.assign(h, JSON.parse(old)); } catch(e) {} }
        }
        h[ds] = {
            pieces: gameState.pieces.map(p => ({id:p.id, rotation:p.rotation, reflected:p.reflected, row:p.row, col:p.col}))
        };
        localStorage.setItem(historyKey(), JSON.stringify(h));
    } catch(e) {}
}

function loadHistory() {
    try {
        let r = localStorage.getItem(historyKey());
        // Fallback: try v3 history key for dragonfjord
        if (!r && gameState.variant === 'dragonfjord') r = localStorage.getItem(HK_OLD);
        return r ? JSON.parse(r) : {};
    } catch(e) { return {}; }
}

function restoreHistoryState(dateKey) {
    const history = loadHistory();
    const entry = history[dateKey];
    if (!entry) return false;

    // Guard: old entries may not have pieces data
    if (!entry.pieces || !Array.isArray(entry.pieces)) {
        alert(t('no_pieces_data'));
        return false;
    }

    // Auto-save current board state before overwriting
    saveGame();

    // Load pieces from history
    gameState.pieces.forEach(p => {
        const saved = entry.pieces.find(s => s.id === p.id);
        if (saved) {
            p.rotation = saved.rotation;
            p.reflected = saved.reflected;
            p.row = saved.row;
            p.col = saved.col;
        }
    });

    gameState.viewingDate = dateKey;
    gameState.undoStack = [];
    clearDragState();

    renderTray();
    renderPieceBank();
    updateAllI18n();
    updateTitle();
    updateTargetDisplay();

    // Close dialog
    document.getElementById('history-overlay').classList.add('hidden');

    return true;
}

function returnToToday() {
    gameState.viewingDate = null;
    gameState.undoStack = [];
    clearDragState();

    // Try to reload today's saved state; otherwise init fresh
    const loaded = loadGame();
    if (!loaded) initPieces();

    renderTray();
    renderPieceBank();
    updateAllI18n();
    updateTitle();
    updateTargetDisplay();
}

function loadSettings() {
    try {
        let r = localStorage.getItem(TK);
        // Fallback: try v3 settings
        if (!r) r = localStorage.getItem(TK_OLD);
        if (!r) return;
        const s = JSON.parse(r);
        if (s.language) gameState.language = s.language;
        if (s.theme) gameState.theme = s.theme;
        if (s.variant) gameState.variant = s.variant;
    } catch(e) {}
}

function saveSettings() {
    try { localStorage.setItem(TK, JSON.stringify({
        language: gameState.language,
        theme: gameState.theme,
        variant: gameState.variant,
    })); } catch(e) {}
}

// ============================================================
// THEME
// ============================================================
function applyTheme() {
    document.body.classList.remove('dark','light');
    if (gameState.theme === 'dark') document.body.classList.add('dark');
    else if (gameState.theme === 'light') document.body.classList.add('light');
    const moonIcon = document.querySelector('#btn-theme .icon-moon');
    const sunIcon = document.querySelector('#btn-theme .icon-sun');
    if (moonIcon && sunIcon) {
        if (isDark()) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    }
    // Update title and auto indicator
    const btn = document.getElementById('btn-theme');
    if (btn) {
        if (gameState.theme === 'auto') {
            btn.title = t('theme_auto');
            btn.classList.add('theme-auto');
        } else if (gameState.theme === 'dark') {
            btn.title = t('theme_dark');
            btn.classList.remove('theme-auto');
        } else {
            btn.title = t('theme_light');
            btn.classList.remove('theme-auto');
        }
    }
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
        const csFromHeight = Math.floor((window.innerHeight - fixedOverhead - TRAY_PADDING * 2) / effectiveRows());
        cs = Math.min(cs, csFromHeight);

        cs = Math.max(cs, 20);
        cs = Math.min(cs, 60);
    } else {
        // ---- Portrait: bank below tray ----
        const mw = Math.min(window.innerWidth - 28, 520);
        cs = Math.floor((mw - TRAY_PADDING * 2) / TRAY_COLS);

        // Fixed overhead: app padding + header + date + tray pad + bank (~3 tray-cell units) + controls + gaps
        const fixedOverhead = 240;
        const cellUsage = effectiveRows() + 3;
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
function canvasH() { return effectiveRows() * gameState.cellSize + TRAY_PADDING * 2; }

function effectiveRows() {
    const config = TRAY_CONFIGS[getVariant().trayType];
    return config.hasWeekdays ? TRAY_ROWS : TRAY_ROWS - 1;
}

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

// Build a path tracing only the outer perimeter of a polyomino shape.
// Used for inner stroke so internal cell boundaries are not drawn.
function createOuterBoundaryPath(grid, ox, oy, cs) {
    const rad = Math.max(2, Math.min(Math.round(cs * 0.1), 8));
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    const filled = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === 1;

    // Step 1: Collect undirected outer edges via cancellation.
    // Internal edges (shared by two adjacent filled cells) appear twice and cancel.
    const edgeSet = new Set();

    function toggle(x1, y1, x2, y2) {
        let key;
        if (x1 < x2 || (x1 === x2 && y1 <= y2)) {
            key = `${x1},${y1}-${x2},${y2}`;
        } else {
            key = `${x2},${y2}-${x1},${y1}`;
        }
        if (edgeSet.has(key)) edgeSet.delete(key);
        else edgeSet.add(key);
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== 1) continue;
            const x = ox + c * cs;
            const y = oy + r * cs;
            toggle(x, y, x + cs, y);           // top
            toggle(x + cs, y, x + cs, y + cs); // right
            toggle(x, y + cs, x + cs, y + cs); // bottom
            toggle(x, y, x, y + cs);           // left
        }
    }

    if (edgeSet.size === 0) return new Path2D();

    // Step 2: Build adjacency map (point -> list of neighbor points)
    const adj = new Map();
    const addNeighbor = (x1, y1, x2, y2) => {
        const k1 = `${x1},${y1}`;
        const k2 = `${x2},${y2}`;
        if (!adj.has(k1)) adj.set(k1, []);
        if (!adj.has(k2)) adj.set(k2, []);
        adj.get(k1).push({x: x2, y: y2});
        adj.get(k2).push({x: x1, y: y1});
    };

    for (const key of edgeSet) {
        const [p1, p2] = key.split('-');
        const [x1, y1] = p1.split(',').map(Number);
        const [x2, y2] = p2.split(',').map(Number);
        addNeighbor(x1, y1, x2, y2);
    }

    // Step 3: Walk the perimeter to produce an ordered point list.
    // Start from the top-leftmost vertex.
    let startKey = null;
    let minY = Infinity, minX = Infinity;
    for (const k of adj.keys()) {
        const [px, py] = k.split(',').map(Number);
        if (py < minY || (py === minY && px < minX)) {
            minY = py; minX = px; startKey = k;
        }
    }

    const pts = [];
    let cur = startKey;
    let prev = null;

    do {
        const [px, py] = cur.split(',').map(Number);
        pts.push({x: px, y: py});

        const neighbors = adj.get(cur) || [];
        let next = null;
        for (const n of neighbors) {
            const nk = `${n.x},${n.y}`;
            if (nk !== prev) { next = nk; break; }
        }
        prev = cur;
        cur = next;
    } while (cur && cur !== startKey);

    if (pts.length < 3) return new Path2D();

    // Step 4: Build Path2D with corner rounding at convex and concave vertices.
    const path = new Path2D();
    const n = pts.length;

    // Determine corner type at a grid intersection (pixel coords -> grid coords)
    function cornerType(px, py) {
        const gc = Math.round((px - ox) / cs);
        const gr = Math.round((py - oy) / cs);
        let total = 0;
        if (filled(gr - 1, gc - 1)) total++;
        if (filled(gr - 1, gc))     total++;
        if (filled(gr, gc - 1))     total++;
        if (filled(gr, gc))         total++;
        return total === 1 ? 'convex' : total === 3 ? 'concave' : 'flat';
    }

    // Start: adjust if first vertex needs corner rounding
    const firstType = cornerType(pts[0].x, pts[0].y);
    if (firstType === 'convex' || firstType === 'concave') {
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const t = Math.min(rad / len, 1);
        path.moveTo(pts[0].x + dx * t, pts[0].y + dy * t);
    } else {
        path.moveTo(pts[0].x, pts[0].y);
    }

    for (let i = 0; i < n; i++) {
        const curr = pts[i];
        const next = pts[(i + 1) % n];
        const nextNext = pts[(i + 2) % n];

        const ct = cornerType(next.x, next.y);

        if (ct === 'convex' || ct === 'concave') {
            // Approach tangent on curr->next edge
            const dx1 = next.x - curr.x;
            const dy1 = next.y - curr.y;
            const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const t1 = Math.min(rad / len1, 1);
            path.lineTo(next.x - dx1 * t1, next.y - dy1 * t1);

            // Arc around the corner to exit tangent (arcTo handles convex & concave alike)
            const dx2 = nextNext.x - next.x;
            const dy2 = nextNext.y - next.y;
            const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const t2 = Math.min(rad / len2, 1);
            path.arcTo(next.x, next.y, next.x + dx2 * t2, next.y + dy2 * t2, rad);
        } else {
            path.lineTo(next.x, next.y);
        }
    }

    path.closePath();
    return path;
}

// Draw a piece at pixel position (no grid snap) — used for drag clone
function drawPieceAt(shape, ox, oy, cs, color) {
    const outlinePath = createOuterBoundaryPath(shape, ox, oy, cs);
    const b = getPiecePixelBounds({ baseShape: shape, rotation: 0, reflected: false }, ox, oy, cs);

    // Clip to piece outer perimeter for fill + stroke
    ctx.save();
    ctx.clip(outlinePath);

    // 3-stop bevel gradient (same approach as tray): lighter -> base -> darker
    const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    grad.addColorStop(0, lighter(color, 0.45));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darker(color, 0.25));
    ctx.fillStyle = grad;
    ctx.fillRect(b.x - 20, b.y - 20, b.w + 40, b.h + 40);

    // Inner stroke for 3D definition (outer perimeter only, bevel gradient)
    const strokeW = Math.max(0.4, Math.min(Math.round(cs * 0.035), 1.5));
    ctx.lineWidth = strokeW * 2;
    const strokeGrad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    strokeGrad.addColorStop(0, 'rgba(220,220,220,0.18)');
    strokeGrad.addColorStop(0.5, 'rgba(0,0,0,0.05)');
    strokeGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.strokeStyle = strokeGrad;
    ctx.stroke(outlinePath);

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

    // ---- Recessed area with rounded corners (outer perimeter path) ----
    const trayGrid = [];
    for (let r = 0; r < TRAY_ROWS; r++) {
        trayGrid[r] = [];
        for (let c = 0; c < TRAY_COLS; c++) {
            trayGrid[r][c] = isBlocked(r, c) ? 0 : 1;
        }
    }
    const recessPath = createOuterBoundaryPath(trayGrid, TRAY_PADDING, TRAY_PADDING, cs);

    ctx.save();
    ctx.clip(recessPath);

    // Fill recess
    ctx.fillStyle = trayRecess;
    ctx.fillRect(0, 0, w, h);

    // Inner stroke along recess perimeter (same parameters as piece stroke)
    const recessSW = Math.max(0.4, Math.min(Math.round(cs * 0.035), 1.5));
    ctx.lineWidth = recessSW * 2;
    const recessSG = ctx.createLinearGradient(TRAY_PADDING, TRAY_PADDING, w - TRAY_PADDING, h - TRAY_PADDING);
    recessSG.addColorStop(0, 'rgba(220,220,220,0.18)');
    recessSG.addColorStop(0.5, 'rgba(0,0,0,0.05)');
    recessSG.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.strokeStyle = recessSG;
    ctx.stroke(recessPath);

    ctx.restore();

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
    const isViewing = !!gameState.viewingDate;
    const target = getTodayTarget(isViewing ? gameState.viewingDate : undefined);
    const el = document.getElementById('target-date');
    const labelEl = document.querySelector('.date-label');
    const config = TRAY_CONFIGS[getVariant().trayType];

    // Update label
    labelEl.textContent = isViewing ? t('viewing_past') : t('today');

    // Date string: include weekday only for full-tray variants
    if (config.hasWeekdays) {
        el.innerHTML = `<span style="font-weight:700;font-size:1.05rem;">${target.targetMonth} · ${target.targetDay} · ${target.targetWeekday}</span>`;
    } else {
        el.innerHTML = `<span style="font-weight:700;font-size:1.05rem;">${target.targetMonth} · ${target.targetDay}</span>`;
    }

    // Show/hide return-to-today button
    const btn = document.getElementById('btn-return-today');
    if (btn) btn.style.display = isViewing ? '' : 'none';
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

        // Outer perimeter path for clip + fill + stroke
        const outlinePath = createOuterBoundaryPath(shape, 0, 0, bcs);

        pctx.save();
        pctx.clip(outlinePath);

        // 3-stop bevel gradient (same approach as tray): lighter -> base -> darker
        const bx = 0, by = 0, bw = cols * bcs, bh = rows * bcs;
        const grad = pctx.createLinearGradient(bx, by, bx + bw, by + bh);
        grad.addColorStop(0, lighter(color, 0.4));
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, darker(color, 0.2));
        pctx.fillStyle = grad;
        pctx.fillRect(bx - 10, by - 10, bw + 20, bh + 20);

        // Inner stroke for 3D definition (outer perimeter only, bevel gradient)
        const bStrokeW = Math.max(0.8, Math.min(Math.round(bcs * 0.05), 3));
        pctx.lineWidth = bStrokeW * 2;
        const bStrokeGrad = pctx.createLinearGradient(bx, by, bx + bw, by + bh);
        bStrokeGrad.addColorStop(0, 'rgba(220,220,220,0.18)');
        bStrokeGrad.addColorStop(0.5, 'rgba(0,0,0,0.05)');
        bStrokeGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
        pctx.strokeStyle = bStrokeGrad;
        pctx.stroke(outlinePath);

        pctx.restore();

        container.appendChild(pc);

        // ---- Events ----
        container.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            handleBankPointerDown(e, piece.id, container);
        });
        container.addEventListener('pointermove', (e) => {
            if (gameState.dragPieceId !== piece.id) return;
            // Ignore moves while waiting for click-to-rotate timer.
            // After pointerup, clickTimer is set for 280ms; moving the mouse
            // during this window must not trigger a drag — there is no active
            // pointer capture to deliver the pointerup that would clean up.
            if (gameState.clickTimer) return;
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
        flipPiece(gameState.clickPieceId);
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
        rotatePiece(pieceId);
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
        // Was a click — schedule flip (wait for possible double-click)
        gameState.clickPieceId = pieceId;
        gameState.clickTimer = setTimeout(() => {
            gameState.clickTimer = null;
            if (gameState.clickPieceId === pieceId && !gameState.dragMoved) {
                flipPiece(pieceId);
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

    // Outer perimeter path for clip + fill + stroke
    const outlinePath = createOuterBoundaryPath(shape, 0, 0, cs);

    dctx.save();
    dctx.clip(outlinePath);

    // 3-stop bevel gradient (same approach as tray): lighter -> base -> darker
    const grad = dctx.createLinearGradient(0, 0, cols*cs, rows*cs);
    grad.addColorStop(0, lighter(color, 0.45));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darker(color, 0.25));
    dctx.fillStyle = grad;
    dctx.fillRect(-10, -10, cols*cs + 20, rows*cs + 20);

    // Inner stroke for 3D definition (outer perimeter only, bevel gradient)
    const dStrokeW = Math.max(0.8, Math.min(Math.round(cs * 0.05), 3));
    dctx.lineWidth = dStrokeW * 2;
    const dStrokeGrad = dctx.createLinearGradient(0, 0, cols * cs, rows * cs);
    dStrokeGrad.addColorStop(0, 'rgba(220,220,220,0.18)');
    dStrokeGrad.addColorStop(0.5, 'rgba(0,0,0,0.05)');
    dStrokeGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
    dctx.strokeStyle = dStrokeGrad;
    dctx.stroke(outlinePath);

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
    // If actively dragging from bank (moved), ignore canvas events
    if (gameState.dragMoved && gameState.dragPieceId != null && !gameState.dragFromTray) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cs = gameState.cellSize;
    const col = Math.floor((px - TRAY_PADDING) / cs);
    const row = Math.floor((py - TRAY_PADDING) / cs);

    const placed = findPieceAtCell(row, col);
    if (!placed) {
        // Clicked empty area — resolve any pending click (bank or tray)
        if (gameState.clickTimer && gameState.clickPieceId != null && !gameState.dragMoved) {
            clearTimeout(gameState.clickTimer);
            gameState.clickTimer = null;
            flipPiece(gameState.clickPieceId);
            gameState.clickPieceId = null;
            gameState.clickTime = 0;
            clearDragState();
            renderTray();
            renderPieceBank();
        }
        return;
    }

    e.preventDefault();

    const now = Date.now();

    // If we have a pending click on a DIFFERENT piece (bank or tray), resolve it first
    if (gameState.clickTimer && gameState.clickPieceId != null && gameState.clickPieceId !== placed.id) {
        clearTimeout(gameState.clickTimer);
        gameState.clickTimer = null;
        flipPiece(gameState.clickPieceId);
        gameState.clickPieceId = null;
        gameState.clickTime = 0;
    }

    // Double-click detection (same piece within 350ms)
    if (gameState.clickPieceId === placed.id && (now - gameState.clickTime) < 350 && !gameState.dragMoved) {
        if (gameState.clickTimer) { clearTimeout(gameState.clickTimer); gameState.clickTimer = null; }
        gameState.clickPieceId = null;
        gameState.clickTime = 0;
        clearDragState();
        rotatePieceAt(placed.id, row, col);
        return;
    }

    // Start drag from tray
    gameState.dragPieceId = placed.id;
    gameState.dragFromTray = true;
    gameState.dragStartX = e.clientX;
    gameState.dragStartY = e.clientY;
    gameState.dragMoved = false;
    gameState.dragClientX = e.clientX;
    gameState.dragClientY = e.clientY;
    gameState.clickPieceId = placed.id;
    gameState.clickTime = now;

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
    // Ignore moves while waiting for click-to-flip timer (same guard as bank pieces)
    if (gameState.clickTimer) return;

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

    const pieceId = gameState.dragPieceId;

    if (gameState.dragMoved) {
        tryDropOnTray();
        clearDragState();
        renderTray();
        renderPieceBank();
    } else {
        // Was a click — schedule flip (wait for possible double-click)
        gameState.clickPieceId = pieceId;
        gameState.clickTimer = setTimeout(() => {
            gameState.clickTimer = null;
            if (gameState.clickPieceId === pieceId && !gameState.dragMoved) {
                flipPiece(pieceId);
                gameState.clickPieceId = null;
                gameState.clickTime = 0;
            }
            clearDragState();
            renderTray();
            renderPieceBank();
        }, 280);
    }
});

canvas.addEventListener('lostpointercapture', () => {
    // Only clear if no pending click timer (timer will clean up after it fires)
    if (gameState.dragFromTray && gameState.clickTimer == null) {
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
        openHistoryDialog();
    });
    document.getElementById('btn-help').addEventListener('click', () => {
        document.getElementById('help-overlay').classList.remove('hidden');
    });
    document.getElementById('btn-close-help').addEventListener('click', () => {
        document.getElementById('help-overlay').classList.add('hidden');
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
    document.getElementById('btn-close-variant').addEventListener('click', () => {
        document.getElementById('variant-overlay').classList.add('hidden');
    });

    // Title click → variant selector
    document.querySelector('.title').addEventListener('click', () => {
        document.getElementById('variant-overlay').classList.remove('hidden');
        renderVariantList();
    });

    // Calendar navigation
    document.getElementById('cal-prev-year').addEventListener('click', () => navigateCalendar(-1, 0));
    document.getElementById('cal-prev-month').addEventListener('click', () => navigateCalendar(0, -1));
    document.getElementById('cal-next-month').addEventListener('click', () => navigateCalendar(0, 1));
    document.getElementById('cal-next-year').addEventListener('click', () => navigateCalendar(1, 0));

    // Calendar day click (event delegation)
    document.getElementById('calendar-grid').addEventListener('click', (e) => {
        const dayEl = e.target.closest('.cal-day.completed');
        if (!dayEl) return;
        const dateKey = dayEl.dataset.date;
        if (dateKey) restoreHistoryState(dateKey);
    });

    // Return to today
    document.getElementById('btn-return-today').addEventListener('click', () => {
        returnToToday();
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

    // System language change
    window.addEventListener('languagechange', () => {
        if (gameState.language === 'auto') {
            buildCellMeta(detectSystemLanguage(), getVariant().trayType);
            updateAllI18n();
            updateTitle();
            renderTray();
            renderPieceBank();
        }
    });

    // Resize — also updates title for orientation-based short/full name
    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { updateTitle(); renderTray(); renderPieceBank(); }, 150);
    });
}

function renderLangList() {
    const list = document.getElementById('lang-list');
    list.innerHTML = '';

    // "Follow system" option — fixed at top
    const autoBtn = document.createElement('button');
    autoBtn.className = 'lang-btn';
    if (gameState.language === 'auto') autoBtn.classList.add('active');
    autoBtn.textContent = t('lang_auto');
    autoBtn.addEventListener('click', () => setLanguage('auto'));
    list.appendChild(autoBtn);

    // Divider
    const divider = document.createElement('div');
    divider.className = 'lang-divider';
    list.appendChild(divider);

    // Scrollable language list
    const scroll = document.createElement('div');
    scroll.className = 'lang-scroll';

    LANGUAGES.forEach(l => {
        const btn = document.createElement('button');
        btn.className = 'lang-btn';
        if (l.code === gameState.language) btn.classList.add('active');
        btn.textContent = l.nativeName;
        btn.addEventListener('click', () => setLanguage(l.code));
        scroll.appendChild(btn);
    });

    list.appendChild(scroll);
}

function setLanguage(code) {
    gameState.language = code;
    buildCellMeta(resolvedLanguage(), getVariant().trayType);
    saveSettings();
    updateAllI18n();
    updateTitle();
    renderTray();
    renderPieceBank();
    document.getElementById('lang-overlay').classList.add('hidden');
}

// ============================================================
// VARIANT SELECTOR
// ============================================================
function renderVariantList() {
    const list = document.getElementById('variant-list');
    list.innerHTML = '';
    VARIANTS.forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'variant-btn';
        if (v.id === gameState.variant) btn.classList.add('active');
        btn.innerHTML = `<strong>${t(v.nameKey)}</strong>`;
        btn.addEventListener('click', () => switchVariant(v.id));
        list.appendChild(btn);
    });
}

function switchVariant(variantId) {
    if (variantId === gameState.variant) {
        document.getElementById('variant-overlay').classList.add('hidden');
        return;
    }
    gameState.variant = variantId;
    gameState.viewingDate = null;
    buildCellMeta(resolvedLanguage(), getVariant().trayType);
    initPieces();
    const loaded = loadGame();
    saveSettings();
    renderTray();
    renderPieceBank();
    updateAllI18n();
    updateTitle();
    updateTargetDisplay();
    document.getElementById('variant-overlay').classList.add('hidden');
    if (loaded && checkWin()) setTimeout(handleWin, 500);
}

function openHistoryDialog() {
    const now = new Date();
    gameState.calendarYear = now.getFullYear();
    gameState.calendarMonth = now.getMonth();
    document.getElementById('history-overlay').classList.remove('hidden');
    renderCalendar();
}

function renderCalendar() {
    const y = gameState.calendarYear;
    const m = gameState.calendarMonth;
    const lang = resolvedLanguage();
    const months = I18N_MONTHS[lang];

    // Header
    document.getElementById('cal-month-year').textContent = `${months[m]} ${y}`;

    // Grid
    const grid = document.getElementById('calendar-grid');
    const history = loadHistory();
    const todayKey = formatDateKey();
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();

    // Short weekday headers
    const shortDays = TRANSLATIONS[lang].cal_weekdays || I18N_WEEKDAYS[lang].map(w => w.slice(0, 2));

    let html = '';
    for (let d = 0; d < 7; d++) {
        html += `<div class="cal-day-header">${shortDays[d]}</div>`;
    }

    // First day of month (0=Sun) and days in month
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    // Leading empty cells (previous month)
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="cal-day other-month"></div>`;
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const isCompleted = !!history[dateKey];
        const isToday = (y === todayYear && m === todayMonth && day === todayDay);
        let cls = 'cal-day';
        if (isCompleted) cls += ' completed';
        if (isToday) cls += ' today';
        const dataAttr = isCompleted ? ` data-date="${dateKey}"` : '';
        html += `<div class="${cls}"${dataAttr}>${day}</div>`;
    }

    // Trailing empty cells
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) {
        html += `<div class="cal-day other-month"></div>`;
    }

    grid.innerHTML = html;
}

function navigateCalendar(dy, dm) {
    gameState.calendarMonth += dm;
    gameState.calendarYear += dy;
    if (gameState.calendarMonth < 0) {
        gameState.calendarMonth = 11;
        gameState.calendarYear--;
    }
    if (gameState.calendarMonth > 11) {
        gameState.calendarMonth = 0;
        gameState.calendarYear++;
    }
    renderCalendar();
}

// ============================================================
// INIT
// ============================================================
function init() {
    loadSettings();
    buildCellMeta(resolvedLanguage(), getVariant().trayType);
    applyTheme();
    initPieces();

    const loaded = loadGame();

    renderTray();
    renderPieceBank();
    updateAllI18n();
    updateTitle();
    updateTargetDisplay();
    setupUI();

    if (loaded && checkWin()) setTimeout(handleWin, 500);

    console.log('🧩 A Puzzle A Day v4 ready!');
    console.log(`   Variant: ${getVariant().id} | Today: ${getTodayTarget().targetMonth} ${getTodayTarget().targetDay} ${getTodayTarget().targetWeekday}`);
    console.log('   Drag pieces into tray | Click = flip | Double-click = rotate');
}

document.addEventListener('DOMContentLoaded', init);
