/**
 * Predefined Color Palette
 * Mirror of backend color_palette.py for frontend use.
 * 16 predefined colors with Tailwind CSS classes.
 */

export const PREDEFINED_COLORS = [
    {
        name: 'yellow-orange',
        bg: 'bg-amber-100',
        border: 'border-amber-500',
        text: 'text-amber-900',
        hover: 'hover:bg-amber-200',
        // Hex values for visual swatches
        bgHex: '#fef3c7',
        borderHex: '#f59e0b'
    },
    {
        name: 'yellow',
        bg: 'bg-yellow-100',
        border: 'border-yellow-500',
        text: 'text-yellow-900',
        hover: 'hover:bg-yellow-200',
        bgHex: '#fef9c3',
        borderHex: '#eab308'
    },
    {
        name: 'orange',
        bg: 'bg-orange-100',
        border: 'border-orange-500',
        text: 'text-orange-900',
        hover: 'hover:bg-orange-200',
        bgHex: '#ffedd5',
        borderHex: '#f97316'
    },
    {
        name: 'red',
        bg: 'bg-red-100',
        border: 'border-red-500',
        text: 'text-red-900',
        hover: 'hover:bg-red-200',
        bgHex: '#fee2e2',
        borderHex: '#ef4444'
    },
    {
        name: 'blue',
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        text: 'text-blue-900',
        hover: 'hover:bg-blue-200',
        bgHex: '#dbeafe',
        borderHex: '#3b82f6'
    },
    {
        name: 'purple',
        bg: 'bg-purple-100',
        border: 'border-purple-500',
        text: 'text-purple-900',
        hover: 'hover:bg-purple-200',
        bgHex: '#f3e8ff',
        borderHex: '#a855f7'
    },
    {
        name: 'teal',
        bg: 'bg-teal-100',
        border: 'border-teal-500',
        text: 'text-teal-900',
        hover: 'hover:bg-teal-200',
        bgHex: '#ccfbf1',
        borderHex: '#14b8a6'
    },
    {
        name: 'light-purple',
        bg: 'bg-violet-100',
        border: 'border-violet-500',
        text: 'text-violet-900',
        hover: 'hover:bg-violet-200',
        bgHex: '#ede9fe',
        borderHex: '#8b5cf6'
    },
    {
        name: 'light-blue',
        bg: 'bg-sky-100',
        border: 'border-sky-500',
        text: 'text-sky-900',
        hover: 'hover:bg-sky-200',
        bgHex: '#e0f2fe',
        borderHex: '#0ea5e9'
    },
    {
        name: 'green',
        bg: 'bg-emerald-100',
        border: 'border-emerald-500',
        text: 'text-emerald-900',
        hover: 'hover:bg-emerald-200',
        bgHex: '#d1fae5',
        borderHex: '#10b981'
    },
    {
        name: 'black',
        bg: 'bg-gray-800',
        border: 'border-gray-900',
        text: 'text-white',
        hover: 'hover:bg-gray-700',
        bgHex: '#1f2937',
        borderHex: '#111827'
    },
    {
        name: 'muted-gray',
        bg: 'bg-slate-200',
        border: 'border-slate-500',
        text: 'text-slate-900',
        hover: 'hover:bg-slate-300',
        bgHex: '#e2e8f0',
        borderHex: '#64748b'
    },
    {
        name: 'brown',
        bg: 'bg-amber-200',
        border: 'border-amber-700',
        text: 'text-amber-900',
        hover: 'hover:bg-amber-300',
        bgHex: '#fde68a',
        borderHex: '#b45309'
    },
    {
        name: 'light-pink',
        bg: 'bg-pink-100',
        border: 'border-pink-400',
        text: 'text-pink-900',
        hover: 'hover:bg-pink-200',
        bgHex: '#fce7f3',
        borderHex: '#f472b6'
    },
    {
        name: 'kiwi',
        bg: 'bg-lime-100',
        border: 'border-lime-500',
        text: 'text-lime-900',
        hover: 'hover:bg-lime-200',
        bgHex: '#ecfccb',
        borderHex: '#84cc16'
    },
    {
        name: 'rose',
        bg: 'bg-rose-100',
        border: 'border-rose-500',
        text: 'text-rose-900',
        hover: 'hover:bg-rose-200',
        bgHex: '#ffe4e6',
        borderHex: '#f43f5e'
    },
];

// Build lookup map for fast access by name
const colorByName = {};
PREDEFINED_COLORS.forEach(c => colorByName[c.name] = c);

/**
 * Get color configuration by name.
 * @param {string} name - Color name (e.g., 'blue', 'green')
 * @returns {Object|null} Color object or null if not found
 */
export function getColorByName(name) {
    return colorByName[name] || null;
}

/**
 * Get just the Tailwind classes for a color name.
 * @param {string} name - Color name
 * @returns {Object|null} Object with bg, border, text, hover keys
 */
export function getColorClasses(name) {
    const color = colorByName[name];
    if (!color) return null;
    return {
        bg: color.bg,
        border: color.border,
        text: color.text,
        hover: color.hover
    };
}
