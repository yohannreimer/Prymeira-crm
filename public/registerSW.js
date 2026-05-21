if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister())),
    )
    .then(() => {
      if ("caches" in window) {
        return caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
      }
    })
    .then(() => {
      if (!sessionStorage.getItem("crm-sw-reset")) {
        sessionStorage.setItem("crm-sw-reset", "1");
        window.location.reload();
      }
    })
    .catch(() => undefined);
}
