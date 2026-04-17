

export const randomString = (length = 20, number = true, capLetter = true, smallLetter = true) => {
    const randomChars = `${capLetter ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''}${number ? '0123456789' : ''}${smallLetter ? 'abcdefghijklmnopqrstuvwxyz' : ''}`;
    const indexSize = randomChars.length - 1;

    return Array(length).fill(0).map(() => randomChars.charAt(Math.round(Math.random() * indexSize))).join('');
};