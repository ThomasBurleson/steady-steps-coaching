import { createBrowserRouter } from "react-router";
import App from "./App.tsx";
import BlogList from "./blog/List.tsx";
import BlogArticle from "./blog/Article.tsx";
import NotFound from "./NotFound.tsx";

/**
 * Application route table. Uses the `Component` form (rather than JSX
 * `element`) so this stays a plain `.ts` module with no JSX.
 *
 *   /            → landing page
 *   /blog        → article listing
 *   /blog/:slug  → single article (renders its own "not found" for bad slugs)
 *   *            → styled 404 page
 */
export const router = createBrowserRouter([
  { path: "/", Component: App },
  { path: "/blog", Component: BlogList },
  { path: "/blog/:slug", Component: BlogArticle },
  { path: "*", Component: NotFound },
]);
