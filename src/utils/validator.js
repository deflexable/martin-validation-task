
export const isEmptyString = t =>
    typeof t !== 'string' || t.startsWith(' ') || t.endsWith(' ') || !t;