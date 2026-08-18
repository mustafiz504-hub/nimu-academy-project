const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// On Windows, project paths with spaces (e.g. "Web dev") cause NativeWind's
// tailwind CLI spawn to fail. We provide an explicit cliCommand that wraps
// the tailwindcss CLI path in quotes so the shell handles it correctly.
const twCliPath = require.resolve("tailwindcss/package.json");
const twBin = require("tailwindcss/package.json").bin.tailwindcss;
const twAbsPath = path.join(path.dirname(twCliPath), twBin);

// Wrap the CLI path in quotes to handle spaces in the directory name
const cliCommand = process.platform === "win32"
  ? `node "${twAbsPath}"`
  : `node ${twAbsPath}`;

module.exports = withNativeWind(config, { input: "./global.css", cliCommand });
