// @ts-check

const logsToFilter = ["Lit is in dev mode"];
const patient = process.argv.includes("--patience");

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: "**/*.test.js",
  nodeResolve: true,

  coverageConfig: {
    include: ["src/**/*.js"],
  },

  testFramework: {
    config: {
      timeout: patient ? 20_000 : undefined,
    },
  },

  // TODO: work out why lit dev mode message is being logged
  filterBrowserLogs(log) {
    const arg = log.args[0];

    return typeof arg === "string"
      ? !logsToFilter.some((l) => arg.includes(l))
      : true;
  },
});
