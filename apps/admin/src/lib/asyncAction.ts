// Shared safety net for admin server-action calls.
//
// Root cause of the "Publishing… never finishes" hang: editor handlers set a
// busy/loading flag, `await` a server action, then clear the flag on the happy
// path only — with no try/catch/finally. If the action *throws* (network drop,
// auth redirect, serialization error, or a request that never returns), the flag
// is never cleared and the button is stuck on "Publishing…" forever.
//
// The fix everywhere is: guard re-entry, wrap the awaits in try/catch/finally,
// clear the busy flag in `finally`, and race the call against a timeout so a
// wedged request surfaces an error instead of hanging indefinitely.

/** Default ceiling for a single admin action before we surface a timeout error. */
export const ACTION_TIMEOUT_MS = 45_000;

/**
 * Race a promise against a timeout so the UI can never wait forever. Note: JS
 * promises aren't cancellable, so the underlying request may still complete on
 * the server — but the client stops waiting and can retry, which is what unsticks
 * the "Publishing…" state. Always settles (resolve or reject), so callers can put
 * their `setBusy("")` in `finally` and trust it runs.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number = ACTION_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("The request timed out. Please check your connection and try again."));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/** Human-readable message for any thrown value from a server action. */
export function actionErrorMessage(
  e: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string" && e.trim()) return e;
  return fallback;
}
