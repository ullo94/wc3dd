import ReactMarkdown from "react-markdown";
import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const content = await readContent("rules");
  return (
    <article className="markdown panel">
      <ReactMarkdown>{content.bodyMd}</ReactMarkdown>
    </article>
  );
}
