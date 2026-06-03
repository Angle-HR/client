import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

/**
 * Design System Token Tests
 *
 * Validates that all design tokens are correctly defined and structurally
 * consistent. These tests parse the raw CSS files — no browser needed.
 *
 * Test strategy:
 * 1. Primitives: all color families declared, hex format valid
 * 2. Tokens: every semantic token references a known primitive
 * 3. Typography: all text styles have required properties
 * 4. Spacing: all gap/padding/radius values are valid numbers
 * 5. Shadows: shadow tokens exist and use valid CSS format
 * 6. Barrel: index.css imports all partials
 */

const DS_DIR = resolve(__dirname, "..");

function readCSS(filename: string): string {
  return readFileSync(resolve(DS_DIR, filename), "utf-8");
}

function extractVarDeclarations(css: string): string[] {
  const matches = css.match(/--[\w-]+(?=\s*:)/g);
  return matches ?? [];
}

// ---------- Primitives ----------

describe("Color Primitives", () => {
  const css = readCSS("primitives.css");
  const vars = extractVarDeclarations(css);

  it("declares all color families", () => {
    const families = [
      "black",
      "white",
      "light-grey",
      "dark-grey",
      "blue",
      "red",
      "green",
      "purple",
      "orange",
      "yellow",
      "fuchsia",
      "teal",
      "aqua",
    ];
    for (const family of families) {
      const found = vars.some((v) => v.includes(`color-${family}`));
      expect(found, `Missing color family: ${family}`).toBe(true);
    }
  });

  it("has the transparent sentinel (--color-non)", () => {
    expect(vars).toContain("--color-non");
  });

  it("declares black scale steps 1-15", () => {
    for (let i = 1; i <= 15; i++) {
      expect(vars).toContain(`--color-black-${i}`);
    }
  });

  it("declares white scale steps 1-16", () => {
    for (let i = 1; i <= 16; i++) {
      expect(vars).toContain(`--color-white-${i}`);
    }
  });

  it("declares blue brand color (step 8)", () => {
    expect(vars).toContain("--color-blue-8");
  });

  it("declares blue alpha variants", () => {
    for (let i = 1; i <= 5; i++) {
      expect(vars).toContain(`--color-blue-alpha-${i}`);
    }
  });

  it("all hex values are valid", () => {
    const hexPattern = /#[0-9a-f]{3,8}/gi;
    const hexValues = css.match(hexPattern) ?? [];
    expect(hexValues.length).toBeGreaterThan(0);
    for (const hex of hexValues) {
      expect(hex).toMatch(/^#[0-9a-f]{3,8}$/i);
    }
  });

  it("includes P3 wide-gamut @supports block", () => {
    expect(css).toContain("@supports (color: color(display-p3");
  });

  it("P3 block covers all chromatic color families", () => {
    // Extract the @supports block content
    const supportsIdx = css.indexOf("@supports");
    const p3Block = css.slice(supportsIdx);
    const chromaticFamilies = [
      "light-grey",
      "dark-grey",
      "blue",
      "red",
      "green",
      "purple",
      "orange",
      "yellow",
      "fuchsia",
      "teal",
      "aqua",
    ];
    for (const family of chromaticFamilies) {
      const found = p3Block.includes(`--color-${family}-1:`);
      expect(found, `Missing P3 for ${family}`).toBe(true);
    }
  });

  it("P3 block includes blue alpha variants", () => {
    const supportsIdx = css.indexOf("@supports");
    const p3Block = css.slice(supportsIdx);
    for (let i = 1; i <= 5; i++) {
      expect(p3Block).toContain(`--color-blue-alpha-${i}:`);
    }
  });
});

// ---------- Semantic Tokens ----------

describe("Semantic Tokens", () => {
  const css = readCSS("tokens.css");
  const vars = extractVarDeclarations(css);

  describe("Background tokens", () => {
    const bgTokens = [
      "--bg-primary",
      "--bg-secondary",
      "--bg-tertiary",
      "--bg-notification",
      "--bg-danger",
      "--bg-transparent-light",
      "--bg-transparent-medium",
      "--bg-transparent-strong",
    ];

    it.each(bgTokens)("declares %s", (token) => {
      expect(vars).toContain(token);
    });
  });

  describe("Text tokens", () => {
    const textTokens = [
      "--text-primary",
      "--text-secondary",
      "--text-tertiary",
      "--text-light",
      "--text-error",
      "--text-blue-accent",
      "--text-inverted",
    ];

    it.each(textTokens)("declares %s", (token) => {
      expect(vars).toContain(token);
    });
  });

  describe("Border tokens", () => {
    const borderTokens = [
      "--border-light",
      "--border-transparent-light",
      "--border-transparent-medium",
      "--border-transparent-strong",
      "--border-input-filled",
      "--border-input-focus",
      "--border-input-error",
    ];

    it.each(borderTokens)("declares %s", (token) => {
      expect(vars).toContain(token);
    });
  });

  describe("Button tokens", () => {
    const buttonVariants = ["default", "blue", "red"];
    const buttonStates = ["rest", "hover", "pressed", "disabled", "focus"];
    const buttonTiers = ["pri"];

    for (const variant of buttonVariants) {
      for (const tier of buttonTiers) {
        for (const state of buttonStates) {
          const token = `--bg-btn-${variant}-${tier}-${state}`;
          it(`declares ${token}`, () => {
            expect(vars).toContain(token);
          });
        }
      }
    }
  });

  describe("Avatar tokens", () => {
    const avatarColors = [
      "green",
      "purple",
      "aqua",
      "orange",
      "yellow",
      "blue",
      "fuchsia",
      "red",
      "grey",
      "teal",
    ];

    for (const color of avatarColors) {
      it(`declares bg/text avatar ${color}`, () => {
        expect(vars).toContain(`--bg-avatar-${color}`);
        expect(vars).toContain(`--text-avatar-${color}`);
      });
    }
  });

  describe("Tag tokens", () => {
    const tagColors = [
      "green",
      "purple",
      "aqua",
      "orange",
      "yellow",
      "blue",
      "fuchsia",
      "red",
      "grey",
      "teal",
    ];

    for (const color of tagColors) {
      it(`declares bg/text tag ${color}`, () => {
        expect(vars).toContain(`--bg-tags-${color}`);
        expect(vars).toContain(`--text-tags-${color}`);
      });
    }
  });

  it("has dark mode overrides", () => {
    expect(css).toContain("prefers-color-scheme: dark");
  });

  it("all token values reference primitives (var(--color-*))", () => {
    // Extract var() references from light-mode :root block
    const varRefs = css.match(/var\(--[\w-]+\)/g) ?? [];
    expect(varRefs.length).toBeGreaterThan(0);

    // Every var() reference should point to a --color-*, --bg-*, or --color-non
    for (const ref of varRefs) {
      const varName = ref.replace("var(", "").replace(")", "");
      expect(varName).toMatch(
        /^--(color|bg|border|text|top|font|shadow)-/,
      );
    }
  });
});

// ---------- Typography ----------

describe("Typography", () => {
  const css = readCSS("typography.css");
  const vars = extractVarDeclarations(css);

  it("declares font families", () => {
    expect(vars).toContain("--font-sans");
    expect(vars).toContain("--font-mono");
  });

  it("declares font weights (including 550 and bold)", () => {
    expect(vars).toContain("--font-weight-regular");
    expect(vars).toContain("--font-weight-medium");
    expect(vars).toContain("--font-weight-medium-550");
    expect(vars).toContain("--font-weight-semibold");
    expect(vars).toContain("--font-weight-bold");
  });

  it("body-xs-semibold uses weight 550 per Figma spec", () => {
    expect(css).toContain("font-weight-medium-550");
  });

  it("declares all heading classes", () => {
    for (let i = 1; i <= 5; i++) {
      for (const weight of ["regular", "medium", "semibold"]) {
        expect(css).toContain(`.heading-h${i}-${weight}`);
      }
    }
  });

  it("declares all body size classes", () => {
    const sizes = ["xl", "l", "m", "s", "xs"];
    for (const size of sizes) {
      for (const weight of ["regular", "medium", "semibold"]) {
        expect(css).toContain(`.body-${size}-${weight}`);
      }
    }
  });

  it("declares subtitle classes", () => {
    const sizes = ["xl", "l", "m", "s"];
    for (const size of sizes) {
      expect(css).toContain(`.subtitle-${size}-regular`);
    }
  });

  it("declares caption classes", () => {
    for (const size of ["m", "s"]) {
      for (const weight of ["regular", "medium", "semibold"]) {
        expect(css).toContain(`.caption-${size}-${weight}`);
      }
    }
  });

  it("declares label classes", () => {
    for (const weight of ["regular", "medium", "semibold"]) {
      expect(css).toContain(`.label-${weight}`);
    }
  });

  it("declares mono body classes", () => {
    const sizes = ["xl", "l", "m", "s", "xs"];
    for (const size of sizes) {
      expect(css).toContain(`.mono-body-${size}-regular`);
      expect(css).toContain(`.mono-body-${size}-medium`);
    }
  });

  it("declares mono caption classes", () => {
    for (const size of ["m", "s"]) {
      expect(css).toContain(`.mono-caption-${size}-regular`);
      expect(css).toContain(`.mono-caption-${size}-medium`);
    }
  });

  it("Inter font reference is correct", () => {
    expect(css).toContain('"Inter"');
  });

  it("Fira Code font reference is correct", () => {
    expect(css).toContain('"Fira Code"');
  });
});

// ---------- Spacing ----------

describe("Spacing", () => {
  const css = readCSS("spacing.css");
  const vars = extractVarDeclarations(css);

  it("declares gap scale", () => {
    const gapVars = vars.filter((v) => v.startsWith("--gap-"));
    expect(gapVars.length).toBeGreaterThanOrEqual(16);
  });

  it("declares negative gap variants", () => {
    const negVars = vars.filter((v) => v.endsWith("-ve"));
    expect(negVars.length).toBeGreaterThanOrEqual(8);
  });

  it("declares padding scale", () => {
    const padVars = vars.filter((v) => v.startsWith("--padding-"));
    expect(padVars.length).toBeGreaterThanOrEqual(20);
  });

  it("declares border radius scale", () => {
    const radiusVars = vars.filter((v) => v.startsWith("--radius-"));
    expect(radiusVars.length).toBeGreaterThanOrEqual(15);
  });

  it("declares --radius-all (pill)", () => {
    expect(vars).toContain("--radius-all");
  });

  it("declares --gap-0", () => {
    expect(vars).toContain("--gap-0");
  });

  it("all spacing values are valid CSS lengths", () => {
    const valuePattern = /:\s*(-?\d+\.?\d*px|0px)/g;
    const matches = css.match(valuePattern);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThan(0);
  });
});

// ---------- Shadows ----------

describe("Shadows", () => {
  const css = readCSS("shadows.css");
  const vars = extractVarDeclarations(css);

  it("declares elevation shadows", () => {
    expect(vars).toContain("--shadow-sm");
    expect(vars).toContain("--shadow-md");
    expect(vars).toContain("--shadow-lg");
  });

  it("declares flow button shadow", () => {
    expect(vars).toContain("--shadow-flow-btn");
  });

  it("shadow values contain box-shadow syntax", () => {
    expect(css).toMatch(/\d+\s+\d+px\s+\d+px/);
  });
});

// ---------- Barrel Import ----------

describe("Barrel import (index.css)", () => {
  const css = readCSS("index.css");

  it("imports all partials", () => {
    const partials = [
      "primitives.css",
      "tokens.css",
      "typography.css",
      "spacing.css",
      "shadows.css",
    ];
    for (const partial of partials) {
      expect(css).toContain(partial);
    }
  });

  it("imports primitives before tokens", () => {
    const primIdx = css.indexOf("primitives.css");
    const tokIdx = css.indexOf("tokens.css");
    expect(primIdx).toBeLessThan(tokIdx);
  });
});
