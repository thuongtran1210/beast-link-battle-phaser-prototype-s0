/**
 * Manages full-screen requests and automatic landscape orientation locking
 * across mobile browsers (Android Chrome, iOS Safari, desktop).
 */

export interface FullscreenCapabilities {
  supported: boolean;
  canLockOrientation: boolean;
  isFullscreen: boolean;
}

export function getFullscreenCapabilities(): FullscreenCapabilities {
  const doc = document as any;
  const supported = !!(
    doc.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  );
  const canLockOrientation = typeof screen !== 'undefined' && 'orientation' in screen && 'lock' in screen.orientation;
  const isFullscreen = !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );

  return { supported, canLockOrientation, isFullscreen };
}

/**
 * Attempts to request fullscreen and lock the screen orientation to landscape.
 * Returns true if fullscreen request succeeded, false otherwise.
 */
export async function requestLandscapeFullscreen(): Promise<boolean> {
  const docEl = document.documentElement as any;

  try {
    // 1. Request fullscreen via cross-browser APIs
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      await docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
    }
  } catch (err) {
    // Some devices (e.g. iPhone Safari) reject element fullscreen; continue to check orientation
  }

  // 2. Try locking orientation to landscape if available
  try {
    if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
      await (screen.orientation as any).lock('landscape').catch(() => {});
    }
  } catch {
    // Ignored: orientation lock is permission/browser dependent
  }

  return getFullscreenCapabilities().isFullscreen;
}

/**
 * Exits fullscreen if active.
 */
export async function exitFullscreen(): Promise<void> {
  const doc = document as any;
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    }

    if (typeof screen !== 'undefined' && screen.orientation && 'unlock' in screen.orientation) {
      (screen.orientation as any).unlock();
    }
  } catch {
    // Ignore exit failures
  }
}

/**
 * Toggles between fullscreen and normal window mode.
 */
export async function toggleFullscreen(): Promise<boolean> {
  if (getFullscreenCapabilities().isFullscreen) {
    await exitFullscreen();
    return false;
  }
  return requestLandscapeFullscreen();
}

/**
 * Checks whether the current device is in portrait orientation.
 */
export function isPortraitOrientation(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerHeight > window.innerWidth;
}
