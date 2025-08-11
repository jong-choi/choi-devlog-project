import { getClusterJSDOM } from "@/app/map/fetchers";

export default async function ClusterGraphSVG() {
  const { html } = await getClusterJSDOM();
  if (!html) {
    console.error("ClusterGraphSVG: html is null");
  }
  return (
    <div
      className="w-full h-full max-h-full min-h-0
      overflow-hidden cursor-grabbing"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
