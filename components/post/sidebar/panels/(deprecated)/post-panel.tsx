import CollapsedPanel from "@/components/post/sidebar/panels/collapsed-panel";
import PanelItem from "@/components/post/sidebar/panels/panel-item";
import { useSidebarStore } from "@/hooks/use-sidebar";

export default function PostPanel() {
  const posts = useSidebarStore((state) => state.selectedSubcategory?.posts);
  const setSelectedPost = useSidebarStore((state) => state.setSelectedPost);
  const selectedPost = useSidebarStore((state) => state.selectedPost);
  const selectedPanel = useSidebarStore((state) => state.selectedPanel);
  const setSelectedPanel = useSidebarStore((state) => state.setSelectedPanel);
  const onCollapsedPanelClick = () => {
    setSelectedPanel("post");
  };
  if (!posts) return <></>;

  if (selectedPost && selectedPanel !== "post") {
    return (
      <CollapsedPanel
        icon="post"
        title={selectedPost.name}
        onClick={onCollapsedPanelClick}
      />
    );
  }
  return (
    <div className="w-64 p-4 border-r border-gray-200 bg-white">
      {posts.map((post) => (
        <PanelItem
          key={"post" + post.id}
          onClick={() => setSelectedPost(post)}
          description={post.name}
          isSelected={selectedPost?.id === post.id}
        />
      ))}
    </div>
  );
}
