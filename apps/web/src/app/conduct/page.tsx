import ReactMarkdown from "react-markdown";
import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ConductPage() {
  const content = await readContent("conduct");
  return (
    <article className="markdown panel">
      <ReactMarkdown>{content.bodyMd}</ReactMarkdown>
    </article>
  );
}
