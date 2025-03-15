import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import { MdxDummy } from "@/components/markdown/mdx-dummy";

export default function Page() {
  const markdown = MdxDummy.data.body;
  return <MarkdownEditor markdown={markdown} />;
}
