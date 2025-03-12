import CollapsedPanel from "@/components/post/sidebar/panels/collapsed-panel";
import PanelItem from "@/components/post/sidebar/panels/panel-item";
import { useSidebarStore } from "@/hooks/use-sidebar";
import { Category } from "@/types/post";

interface CategoryPanelProps {
  categories: Category[];
}

export default function CategoryPanel({ categories }: CategoryPanelProps) {
  const selectedCategory = useSidebarStore((state) => state.selectedCategory);
  const setSelectedCategory = useSidebarStore(
    (state) => state.setSelectedCategory
  );
  const setSelectedSubcategory = useSidebarStore(
    (state) => state.setSelectedSubcategory
  );

  const selectedPanel = useSidebarStore((state) => state.selectedPanel);
  const setSelectedPanel = useSidebarStore((state) => state.setSelectedPanel);

  const onCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedPanel("subcategory");
  };

  const onCollapsedPanelClick = () => {
    setSelectedPanel("category");
  };

  if (selectedCategory && selectedPanel !== "category") {
    return (
      <CollapsedPanel
        icon="category"
        title={selectedCategory.name}
        onClick={onCollapsedPanelClick}
      />
    );
  }

  return (
    <div className="w-64 p-4 border-r border-gray-200 bg-white flex-1">
      {categories.map((category) => (
        <PanelItem
          key={"cat" + category.id}
          onClick={() => onCategorySelect(category)}
          description={category.name}
          isSelected={selectedCategory?.id === category.id}
        />
      ))}
    </div>
  );
}
