/** Production only. Dev must not install a service worker on the Vite port. */
export function registerProductionServiceWorker(): void {
  if (!import.meta.env.PROD) {
    return;
  }
  void import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}
