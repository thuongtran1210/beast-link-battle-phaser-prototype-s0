export type RuntimeMode = 'TestHarness' | 'Prototype' | 'Production';

/** Explicit startup boundary. Default is player-facing Prototype, never test tooling. */
export function runtimeModeFrom(value: string | undefined): RuntimeMode {
  if (value === 'test') return 'TestHarness';
  if (value === 'production') return 'Production';
  return 'Prototype';
}

const globalMode = (globalThis as { __BEAST_LINK_APP_MODE__?: string }).__BEAST_LINK_APP_MODE__;
export const RUNTIME_MODE: RuntimeMode = runtimeModeFrom(globalMode);
export const isTestHarness = (mode: RuntimeMode = RUNTIME_MODE): boolean => mode === 'TestHarness';
