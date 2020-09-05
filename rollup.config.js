import typescript from "@rollup/plugin-typescript";

export default {
  input: "assembler/Assembler.ts",
  output: {
    dir: "build",
    format: "es",
  },
  plugins: [typescript()],
};
