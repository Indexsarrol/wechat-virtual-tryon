import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workspace layout", () => {
  it("defines the expected package.json metadata and scripts", () => {
    const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));

    expect(rootPackage.name).toBe("virtual-tryon-workspace");
    expect(rootPackage.private).toBe(true);
    expect(rootPackage.packageManager).toBe("pnpm@10.0.0");
    expect(rootPackage.scripts.dev).toBe("pnpm -r --parallel dev");
    expect(rootPackage.scripts.build).toBe("pnpm -r build");
    expect(rootPackage.scripts.test).toBe("pnpm -r test");
    expect(rootPackage.scripts.typecheck).toBe("pnpm -r typecheck");
    expect(rootPackage.devDependencies.typescript).toBe("^5.8.3");
    expect(rootPackage.devDependencies.vitest).toBe("^3.2.4");
  });

  it("defines the expected workspace package globs", () => {
    const workspaceLines = readFileSync("pnpm-workspace.yaml", "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    expect(workspaceLines).toContain("packages:");
    expect(workspaceLines).toContain("- apps/*");
    expect(workspaceLines).toContain("- services/*");
    expect(workspaceLines).toContain("- packages/*");
  });

  it("defines the expected tsconfig compiler options", () => {
    const tsconfig = JSON.parse(readFileSync("tsconfig.base.json", "utf8"));

    expect(tsconfig.compilerOptions.baseUrl).toBe(".");
    expect(tsconfig.compilerOptions.target).toBe("ES2022");
    expect(tsconfig.compilerOptions.module).toBe("ESNext");
    expect(tsconfig.compilerOptions.moduleResolution).toBe("Bundler");
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true);
    expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
  });

  it("defines the required gitignore entries", () => {
    const gitignoreLines = readFileSync(".gitignore", "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    expect(gitignoreLines).toContain("node_modules/");
    expect(gitignoreLines).toContain("dist/");
    expect(gitignoreLines).toContain(".DS_Store");
    expect(gitignoreLines).toContain(".env");
    expect(gitignoreLines).toContain(".env.*");
    expect(gitignoreLines).toContain("coverage/");
    expect(gitignoreLines).toContain(".turbo");
    expect(gitignoreLines).toContain(".pnpm-store");
  });

  it("defines the required editorconfig entries", () => {
    const editorconfigLines = readFileSync(".editorconfig", "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    expect(editorconfigLines).toContain("root = true");
    expect(editorconfigLines).toContain("charset = utf-8");
    expect(editorconfigLines).toContain("end_of_line = lf");
    expect(editorconfigLines).toContain("indent_style = space");
    expect(editorconfigLines).toContain("indent_size = 2");
    expect(editorconfigLines).toContain("insert_final_newline = true");
    expect(editorconfigLines).toContain("trim_trailing_whitespace = true");
  });
});
