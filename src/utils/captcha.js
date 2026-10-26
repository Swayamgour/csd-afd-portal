const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghjkmnpqrstuvwxyz";
const NUMBERS = "23456789";
const SPECIAL = "@#$%&*!";

const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL;

const randomChar = (chars) =>
  chars[Math.floor(Math.random() * chars.length)];

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

export const makeCaptcha = () => {
  // Guarantee at least one character from every category
  const captcha = [
    randomChar(UPPERCASE),
    randomChar(LOWERCASE),
    randomChar(NUMBERS),
    randomChar(SPECIAL),
  ];

  // Add one additional random character
  captcha.push(randomChar(ALL_CHARS));

  // Shuffle so the pattern isn't predictable
  return shuffle(captcha).join("");
};

export default makeCaptcha;
