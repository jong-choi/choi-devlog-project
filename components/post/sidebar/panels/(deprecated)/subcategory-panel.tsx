import CollapsedPanel from "@/components/post/sidebar/panels/collapsed-panel";
import PanelItem from "@/components/post/sidebar/panels/panel-item";
import { useSidebarStore } from "@/hooks/use-sidebar";
import { Subcategory } from "@/types/post";

export default function SubcategoryPanel({}) {
  const subcategories = useSidebarStore(
    (state) => state.selectedCategory?.subcategories
  );
  const selectedSubcategory = useSidebarStore(
    (state) => state.selectedSubcategory
  );
  const setSelectedSubcategory = useSidebarStore(
    (state) => state.setSelectedSubcategory
  );
  const setSelectedPost = useSidebarStore((state) => state.setSelectedPost);
  const selectedPanel = useSidebarStore((state) => state.selectedPanel);
  const setSelectedPanel = useSidebarStore((state) => state.setSelectedPanel);

  const onCollapsedPanelClick = () => {
    setSelectedPanel("subcategory");
  };
  const onSubcategorySelect = (category: Subcategory) => {
    setSelectedSubcategory(category);
    setSelectedPost(null);
    setSelectedPanel("post");
  };

  if (!subcategories) return <></>;

  if (selectedSubcategory && selectedPanel !== "subcategory") {
    return (
      <CollapsedPanel
        icon="subcategory"
        title={selectedSubcategory.name}
        onClick={onCollapsedPanelClick}
      />
    );
  }

  return (
    <div className="w-64 p-4 border-r border-gray-200 bg-white">
      {subcategories.map((subcategory) => (
        <PanelItem
          key={"subcat" + subcategory.id}
          onClick={() => onSubcategorySelect(subcategory)}
          description={subcategory.name}
          isSelected={selectedSubcategory?.id === subcategory.id}
        />
      ))}
    </div>
  );
}
