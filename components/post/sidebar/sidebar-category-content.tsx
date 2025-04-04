import { WithSortableItem } from "@/components/post/sortable-list/with-sortable-item";
import { WithSortableList } from "@/components/post/sortable-list/with-sortable-list";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";
import { MoreVertical } from "lucide-react";
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
  const { isOpened, toggleCategory, isSortable } = useSidebarStore(
    useShallow((state) => ({
      isOpened: state.openedCategories[catagory.id] || false,
      toggleCategory: state.toggleCategory,
      isSortable: state.isSortable,
    }))
  );

  return (
    <div key={catagory.id}>
      <div className="flex justify-between items-center">
        <button
          onClick={() => toggleCategory(catagory.id)}
          className={cn(
            "w-full text-left text-sm font-medium px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 transition",
            isSortable && "flex-1 whitespace-nowrap overflow-hidden"
          )}
        >
          {catagory.name}
        </button>
        {isSortable && (
          <div className="text-color-muted -mr-2">
            <MoreVertical className="w-4 h-5 shrink-0" />
          </div>
        )}
      </div>
      {isOpened && (
        <div className="ml-2 mt-1 space-y-1">
          <WithSortableList items={catagory.subcategories}>
            {(sortedSubs) =>
              sortedSubs.map((sub) => (
                <WithSortableItem key={sub.id} id={sub.id}>
                  <div className="flex justify-between items-center w-full">
                    <button
                      onClick={() => {
                        setSubcategory({ id: sub.id, name: sub.name });
                        setRightCollapsed(false);
                      }}
                      className={cn(
                        "block w-full text-left px-4 py-2 text-sm rounded-md transition relative flex-1",
                        selectedSubcategoryId === sub.id
                          ? "text-gray-900 dark:text-white font-semibold bg-glass-bg dark:bg-black"
                          : "text-gray-700 dark:text-gray-300",
                        isSortable && "flex-1 whitespace-nowrap overflow-hidden"
                      )}
                    >
                      {sub.name}
                    </button>
                    {isSortable && (
                      <div className="text-color-muted -mr-2">
                        <MoreVertical className="w-4 h-5 shrink-0" />
                      </div>
                    )}
                  </div>
                </WithSortableItem>
              ))
            }
          </WithSortableList>
        </div>
      )}
    </div>
  );
}
