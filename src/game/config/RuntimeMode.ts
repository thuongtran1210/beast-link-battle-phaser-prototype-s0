export type RuntimeMode = 'Game' | 'TestHarness';

/** Explicit startup boundary. Default is GAME, never test tooling. */
export function runtimeModeFrom(value: string | undefined): RuntimeMode {
  if (value === 'test') return 'TestHarness';
  return 'Game';
}

const globalMode = (globalThis as { __BEAST_LINK_APP_MODE__?: string }).__BEAST_LINK_APP_MODE__;
export const RUNTIME_MODE: RuntimeMode = runtimeModeFrom(globalMode);
export const isTestHarness = (mode: RuntimeMode = RUNTIME_MODE): boolean => mode === 'TestHarness';
