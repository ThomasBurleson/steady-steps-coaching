import { createFileRoute } from "@tanstack/react-router";
import BlogList from "@/app/blog/List.tsx";

// "/blog" → the article listing.
export const Route = createFileRoute("/blog/")({
  component: BlogList,
});
