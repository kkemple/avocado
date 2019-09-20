const grey = {
  900: "#202932",
  800: "#3f4b59",
  700: "#6e7a8a",
  600: "#929fb0",
  500: "#aebecd",
  400: "#cbd4db",
  300: "#d5dee5",
  200: "#e2e7ed",
  100: "#e2e7ed",
  0: "#fff"
};

const primary = {
  100: "#f0f4ff",
  200: "#d4def9",
  300: "#95aeee",
  400: "#768ce1",
  500: "#6075de",
  600: "#485dc6",
  700: "#3447a5",
  800: "#243585",
  900: "#1f2d6e"
};

import Color from "color";

const [R, G, B] = Color(primary["500"])
  .rgb()
  .array();

const shadow = `rgba(${R}, ${G}, ${B}, 0.3)`;
const overlay = `rgba(${R}, ${G}, ${B}, 0.05)`;

export default {
  overlay,
  shadow,
  grey,
  primary,
  foreground: grey["0"],
  borders: primary["100"],
  text: grey["900"],
  inactive: grey["500"],
  tabIconDefault: grey["500"],
  tabIconSelected: primary["500"],
  tabBar: grey["0"],
  errorBackground: "#ff7675",
  errorText: "#fff",
  warningBackground: "#fdcb6e",
  warningText: "#fff",
  noticeBackground: "#74b9ff",
  noticeText: "#fff"
};
