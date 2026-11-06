import ReactMarkdown from "react-markdown";
import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const content = await readContent("maps");
  return (
    <article className="markdown panel">
      <ReactMarkdown>{content.bodyMd}</ReactMarkdown>
    </article>
  );
}
