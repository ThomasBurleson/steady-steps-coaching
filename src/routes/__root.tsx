import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import NotFound from "@/app/error/NotFound";

/**
 * Root route. Renders the matched child route via <Outlet /> and provides the
 * app-wide 404 via `notFoundComponent` (replaces the old "*" route). The router
 * devtools render `null` in production builds.
 */
export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
