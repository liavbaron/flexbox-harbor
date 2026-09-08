// ==============================================================
//  Flexbox Harbor – הגדרת השלבים
//  כל שלב: הוראה ברורה + targetCSS שתואם בדיוק להוראה ולתצוגה.
//  הלוח מוגדר כ-LTR (ראו #game-board ב-CSS), ולכן:
//    justify-content: flex-start = שמאל, flex-end = ימין
//    align-items:     flex-start = למעלה, flex-end = למטה
//  כך שכל אזכור "ימין/שמאל/למעלה/למטה" בהוראות תואם למה שקורה בפועל.
// ==============================================================

const GAME_LEVELS = [
    {
        id: 1,
        title: "שלב 1: עגינה מימין",
        instruction: "הביאו את הסירה כך שתעגון מעל האי שבצד ימין של הלוח.",
        boats: ["⛵"],
        islands: ["🏝️"],
        availableControls: ["justify-content"],
        targetCSS: { "justify-content": "flex-end" },
        initialCSS: { "justify-content": "flex-start" }
    },
    {
        id: 2,
        title: "שלב 2: מרכזו את הצי",
        instruction: "מרכזו את שתי הסירות אופקית (במרכז הלוח משמאל לימין).",
        boats: ["⛵", "🚤"],
        islands: ["🏝️", "🏝️"],
        availableControls: ["justify-content"],
        targetCSS: { "justify-content": "center" },
        initialCSS: { "justify-content": "flex-start" }
    },
    {
        id: 3,
        title: "שלב 3: מעגן בתחתית",
        instruction: "העבירו את הסירה לתחתית הלוח (הסירה תישאר בצד שמאל).",
        boats: ["⛵"],
        islands: ["🏝️"],
        availableControls: ["align-items"],
        targetCSS: { "align-items": "flex-end" },
        initialCSS: { "align-items": "flex-start" }
    },
    {
        id: 4,
        title: "שלב 4: פיזור מקצה לקצה",
        instruction: "פזרו את שלוש הסירות במרווחים שווים, מהקצה השמאלי ועד הקצה הימני.",
        boats: ["⛵", "🚤", "⛵"],
        islands: ["🏝️", "🏝️", "🏝️"],
        availableControls: ["justify-content"],
        targetCSS: { "justify-content": "space-between" },
        initialCSS: { "justify-content": "flex-start" }
    },
    {
        id: 5,
        title: "שלב 5: מרכז הים (שילוב מאפיינים)",
        instruction: "עגנו את הסירה בדיוק במרכז הלוח — גם אופקית וגם אנכית.",
        boats: ["🛥️"],
        islands: ["🏝️"],
        availableControls: ["justify-content", "align-items"],
        targetCSS: { "justify-content": "center", "align-items": "center" },
        initialCSS: { "justify-content": "flex-start", "align-items": "flex-start" }
    },
    {
        id: 6,
        title: "שלב 6: טור אנכי (flex-direction)",
        instruction: "סדרו את הסירות בטור אנכי מלמעלה למטה, כשהן ממורכזות אופקית.",
        boats: ["⛵", "🚤"],
        islands: ["🏝️", "🏝️"],
        availableControls: ["flex-direction", "align-items"],
        targetCSS: { "flex-direction": "column", "align-items": "center" },
        initialCSS: { "flex-direction": "row", "align-items": "flex-start" }
    },
    {
        id: 7,
        title: "שלב 7: טור בסדר הפוך",
        instruction: "סדרו את הסירות בטור בסדר הפוך — הסירה הראשונה למטה והשאר מעליה — ממורכזות אופקית.",
        boats: ["⛵", "🚤"],
        islands: ["🏝️", "🏝️"],
        availableControls: ["flex-direction", "align-items"],
        targetCSS: { "flex-direction": "column-reverse", "align-items": "center" },
        initialCSS: { "flex-direction": "row", "align-items": "flex-start" }
    },
    {
        id: 8,
        title: "שלב 8: גלישת שורות (flex-wrap)",
        instruction: "יש יותר מדי סירות לשורה אחת! אפשרו גלישה לשורות (wrap) ופזרו אותן במרווח שווה בכל שורה.",
        boats: ["⛵", "🚤", "🛥️", "⛵", "🚤", "🛥️"],
        islands: ["🏝️", "🏝️", "🏝️", "🏝️", "🏝️", "🏝️"],
        availableControls: ["flex-wrap", "justify-content"],
        targetCSS: { "flex-wrap": "wrap", "justify-content": "space-around" },
        initialCSS: { "flex-wrap": "nowrap", "justify-content": "flex-start" }
    },
    {
        id: 9,
        title: "שלב 9: תמרון מתקדם (3 מאפיינים)",
        instruction: "סדרו את הסירות בטור אנכי, פרושות במרווח שווה מלמעלה עד למטה, וצמודות לצד ימין של הלוח.",
        boats: ["⛵", "🚤", "🛥️"],
        islands: ["🏝️", "🏝️", "🏝️"],
        availableControls: ["flex-direction", "justify-content", "align-items"],
        targetCSS: {
            "flex-direction": "column",
            "justify-content": "space-between",
            "align-items": "flex-end"
        },
        initialCSS: {
            "flex-direction": "row",
            "justify-content": "flex-start",
            "align-items": "flex-start"
        }
    },
    {
        id: 10,
        title: "שלב 10: האתגר השלם (כל המאפיינים)",
        instruction: "אתגר סופי: אפשרו גלישה לשורות (wrap), החזירו לסידור בשורות (row), ומרכזו את כל הסירות — גם אופקית וגם אנכית.",
        boats: ["⛵", "🚤", "🛥️", "⛵", "🚤", "🛥️"],
        islands: ["🏝️", "🏝️", "🏝️", "🏝️", "🏝️", "🏝️"],
        availableControls: ["flex-direction", "justify-content", "align-items", "flex-wrap"],
        targetCSS: {
            "flex-direction": "row",
            "justify-content": "center",
            "align-items": "center",
            "flex-wrap": "wrap"
        },
        initialCSS: {
            "flex-direction": "column",
            "justify-content": "flex-start",
            "align-items": "flex-start",
            "flex-wrap": "nowrap"
        }
    }
];
