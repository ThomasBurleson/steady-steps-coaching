import { createFileRoute } from "@tanstack/react-router";
import BlogArticle from "@/app/blog/Article.tsx";

// "/blog/:slug" → a single article. The slug is passed as a prop so the
// Article component stays router-agnostic (Article renders its own "not found"
// for unknown slugs).
export const Route = createFileRoute("/blog/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <BlogArticle slug={slug} />;
}
