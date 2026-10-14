/** Online remains an experiment on loopback hosts; public release is coming soon. */
export function isOnlineExperimentAvailable(hostname = typeof window !== 'undefined' ? window.location.hostname : ''): boolean {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname.toLowerCase());
}
