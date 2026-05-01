module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-css-modules"],
  plugins: ["stylelint-order"],
  rules: {
    "order/properties-alphabetical-order": true,
    "no-descending-specificity": null,
    "selector-class-pattern": null,
  },
  ignoreFiles: ["node_modules/**", "dist/**"],
};
