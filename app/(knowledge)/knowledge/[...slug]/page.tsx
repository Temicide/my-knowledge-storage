import { getKnowledgeFileBySlug, getAllSlugs } from "@/lib/content";
import { ReadingPage } from "@/components/knowledge/ReadingPage";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const file = getKnowledgeFileBySlug(slug.join("/"));
  if (!file) return { title: "Not Found" };
  return {
    title: `${file.title} — Knowledge Base`,
    description: file.subtitle || file.title,
    openGraph: {
      title: file.title,
      description: file.subtitle || file.title,
      type: "article",
    },
  };
}

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const file = getKnowledgeFileBySlug(slug.join("/"));
  if (!file) return notFound();
  return <ReadingPage file={file} />;
}
