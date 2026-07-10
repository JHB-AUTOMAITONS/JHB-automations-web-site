"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * A minimal, dependency-free React error boundary shared by the website and every
 * admin preview. Its whole job: contain a render-time throw to the smallest region
 * possible so ONE bad container (malformed data, an unexpected null, a broken
 * embed) can never blank the entire page with "Application error: a client-side
 * exception has occurred".
 *
 * Used two ways:
 *   • Around EACH inserted container in PageContainersView, so a single failing
 *     container renders a small inline notice while its siblings keep rendering.
 *   • Around a whole preview / editor region (admin) as a coarser safety net.
 *
 * `fallback` may be a node or a function of the caught error. `onError` lets the
 * host log to its own telemetry. `resetKeys` re-mounts the children (clearing the
 * error) whenever any key changes — so after the offending edit is undone, the
 * region recovers on its own without a full page refresh.
 */
type Props = {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  /** When any value here changes between renders, the boundary resets itself. */
  resetKeys?: ReadonlyArray<unknown>;
  /** Label used in the default fallback + console output (e.g. a container type). */
  label?: string;
};

type State = { error: Error | null };

function keysChanged(a: ReadonlyArray<unknown> = [], b: ReadonlyArray<unknown> = []): boolean {
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return true;
  return false;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Never let logging itself throw and re-crash the tree.
    try {
      const where = this.props.label ? ` [${this.props.label}]` : "";
      // eslint-disable-next-line no-console
      console.error(`[ErrorBoundary]${where}`, error, info?.componentStack);
      this.props.onError?.(error, info);
    } catch {
      /* ignore */
    }
  }

  componentDidUpdate(prev: Props) {
    // Auto-recover when the inputs that produced the error change (e.g. the user
    // fixes/undoes the edit) — no manual reset or page reload needed.
    if (this.state.error && keysChanged(prev.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback, label } = this.props;
      if (typeof fallback === "function") return fallback(error, this.reset);
      if (fallback !== undefined) return fallback;
      return (
        <div
          role="alert"
          style={{
            margin: "12px 0",
            padding: "12px 14px",
            border: "1px solid rgba(220,38,38,0.35)",
            background: "rgba(220,38,38,0.06)",
            borderRadius: 12,
            color: "#b91c1c",
            font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <strong>This {label || "section"} couldn’t be displayed.</strong>
          <br />
          The rest of the page is unaffected. Check this block’s content or images and try again.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
