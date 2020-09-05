import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "assembler/Assembler.ts",
    output: {
      dir: "lib",
      format: "es",
    },
    plugins: [typescript()],
  },
  {
    input: "vm/VM.ts",
    output: {
      dir: "lib",
      format: "es",
    },
    plugins: [typescript()],
  },
];
