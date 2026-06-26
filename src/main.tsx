import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./app/App.tsx";
import BlogList from "./app/blog/List.tsx";
import BlogArticle from "./app/blog/Article.tsx";
import "./styles/index.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/blog", element: <BlogList /> },
  { path: "/blog/:slug", element: <BlogArticle /> },
]);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>,
);
