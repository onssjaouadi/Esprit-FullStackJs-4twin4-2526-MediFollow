export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");

    // The Aptos SDK uses `got` + `p-cancelable` internally. When the Aptos
    // testnet node is unreachable (ECONNRESET), got's retry logic attaches a
    // cancel handler after the promise is already settled, producing
    // unhandledRejection and uncaughtException events that would crash Next.js.
    // We catch those specific errors here so the DB fallback path can be used
    // without taking down the server.
    const isBlockchainNetworkError = (reason: unknown): boolean => {
      if (!(reason instanceof Error)) return false;
      const m = reason.message ?? "";
      const c = (reason as any).code ?? "";
      const n = reason.name ?? "";
      return (
        c === "ECONNRESET" ||
        c === "ERR_STREAM_DESTROYED" ||
        c === "ETIMEDOUT" ||
        c === "ENOTFOUND" ||
        n === "RequestError" ||
        m.includes("onCancel") ||
        m.includes("stream was destroyed") ||
        m.includes("ERR_STREAM_DESTROYED") ||
        m.includes("after the promise settled")
      );
    };

    process.on("unhandledRejection", (reason) => {
      if (isBlockchainNetworkError(reason)) return; // silently ignore Aptos/got errors
    });

    process.on("uncaughtException", (error) => {
      if (isBlockchainNetworkError(error)) return; // prevent server crash on ECONNRESET
      console.error("[uncaughtException]", error);
      process.exit(1); // default Node.js behaviour for truly unexpected errors
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
