import { WithSortableItem } from "@/components/post/sortable-list/with-sortable-item";
import { WithSortableList } from "@/components/post/sortable-list/with-sortable-list";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";
import { useShallow } from "zustand/react/shallow";

export function SidebarCategoryContent({
  catagory,
  setRightCollapsed,
  selectedSubcategoryId,
  setSubcategory,
}: {
  catagory: Category;
  setRightCollapsed: (state: boolean) => void;
  selectedSubcategoryId?: string | null;
  setSubcategory: (subcategory: { id: string; name: string } | null) => void;
}) {
  const { isOpened, toggleCategory } = useSidebarStore(
    useShallow((state) => ({
      isOpened: state.openedCategories[catagory.id] || false,
      toggleCategory: state.toggleCategory,
    }))
  );

  return (
    <div key={catagory.id}>
      <button
        onClick={() => toggleCategory(catagory.id)}
        className="w-full text-left text-sm font-medium px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 transition"
      >
        {catagory.name}
      </button>

      {isOpened && (
        <div className="ml-2 mt-1 space-y-1">
          <WithSortableList items={catagory.subcategories}>
            {(sortedSubs) =>
              sortedSubs.map((sub) => (
                <WithSortableItem key={sub.id} id={sub.id}>
                  <button
                    onClick={() => {
                      setSubcategory({ id: sub.id, name: sub.name });
                      setRightCollapsed(false);
                    }}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm rounded-md transition",
                      selectedSubcategoryId === sub.id
                        ? "text-gray-900 dark:text-white font-semibold bg-glass-bg dark:bg-black"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {sub.name}
                  </button>
                </WithSortableItem>
              ))
            }
          </WithSortableList>
        </div>
      )}
    </div>
  );
}
