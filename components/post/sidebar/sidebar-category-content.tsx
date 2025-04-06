import { WithSortableItem } from "@/components/post/sortable-list/with-sortable-item";
import { WithSortableList } from "@/components/post/sortable-list/with-sortable-list";
import { UpdatePopover } from "@/components/popover/update-popover/update-popover";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/providers/sidebar-store-provider";
import { Category } from "@/types/post";
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore } from "@/providers/layout-store-provider";

export function SidebarCategoryContent({
  catagory,
  setSidebarRightCollapsed,
  selectedSubcategoryId,
  setSubcategory,
}: {
  catagory: Category;
  setSidebarRightCollapsed: (state: boolean) => void;
  selectedSubcategoryId?: string | null;
  setSubcategory: (subcategory: { id: string; name: string } | null) => void;
}) {
  const { isSortable } = useLayoutStore(
    useShallow((state) => ({
      isSortable: state.isSortable,
    }))
  );

  const { isOpened, toggleCategory } = useSidebarStore(
    useShallow((state) => ({
      isOpened: state.openedCategories[catagory.id] || false,
      toggleCategory: state.toggleCategory,
    }))
  );

  return (
    <div key={catagory.id}>
      <div className="flex justify-between items-center">
        <WithSortableItem key={catagory.id} id={catagory.id}>
          <button
            onClick={() => toggleCategory(catagory.id)}
            className={cn(
              "w-full text-left text-sm font-medium px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 transition",
              isSortable && "flex-1 whitespace-nowrap overflow-hidden"
            )}
          >
            {catagory.name}
          </button>
        </WithSortableItem>
        <UpdatePopover>{(_onClose) => <div />}</UpdatePopover>
      </div>
      {isOpened && (
        <div className="ml-2 mt-1 space-y-1">
          <WithSortableList items={catagory.subcategories}>
            {(sortedSubs) =>
              sortedSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center w-full"
                >
                  <WithSortableItem key={sub.id} id={sub.id}>
                    <button
                      onClick={() => {
                        setSubcategory({ id: sub.id, name: sub.name });
                        setSidebarRightCollapsed(false);
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
                  </WithSortableItem>
                  <UpdatePopover>{(_onClose) => <div />}</UpdatePopover>
                </div>
              ))
            }
          </WithSortableList>
        </div>
      )}
    </div>
  );
}
