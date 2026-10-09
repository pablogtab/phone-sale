export const rounding = (value: number, digits: number = 2) => {
  return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
};
