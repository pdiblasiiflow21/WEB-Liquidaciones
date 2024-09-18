import { getInstance } from "./index";

export const authGuard = (to, from, next) => {
  const authService = getInstance();

  const fn = () => {
    // console.log("AuthGuard", authService.isAuthenticated);
    // If the user is authenticated, continue with the route
    if (authService.isAuthenticated) {
      return next();
    }

    // Otherwise, log in
    // vuexStore.dispatch("auth/authRequest", { appState: { targetUrl: to.fullPath } });
    authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
  };

  // If loading has already finished, check our auth state using `fn()`
  if (!authService.loading) {
    return fn();
  }

  // Watch for the loading property to change before we check isAuthenticated
  authService.$watch("loading", loading => {
    if (loading === false) {
      return fn();
    }
  });
};