import { getAllKnowledgeFiles } from "@/lib/content";
import { ListingPage } from "@/components/knowledge/ListingPage";

export default async function HomePage() {
  const files = getAllKnowledgeFiles();
  return <ListingPage files={files} />;
}
