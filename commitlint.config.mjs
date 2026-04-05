const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Default 100 chars is easy to exceed with editor-wrapped paragraphs; relax for longer URLs and copy-paste bodies.
    "body-max-line-length": [0],
  },
};

export default config;
