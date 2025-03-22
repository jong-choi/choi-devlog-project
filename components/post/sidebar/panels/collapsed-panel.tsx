import { FiBookOpen, FiChevronDown } from "react-icons/fi";
import { FiBook } from "react-icons/fi";
import { PiBooks } from "react-icons/pi";
import { Panel } from "@/types/post";
import { cn } from "@/lib/utils";

interface CollapsedPanelProps {
  icon: Panel;
  title: string;
  onClick: () => void;
}

export default function CollapsedPanel({
  icon,
  title,
  onClick,
}: CollapsedPanelProps) {
  let Icon = FiBook;
  const iconColor = "text-gray-700 dark:text-gray-400";

  switch (icon) {
    case "category":
      Icon = PiBooks;
      break;
    case "subcategory":
      Icon = FiBook;
      break;
    case "post":
      Icon = FiBookOpen;
      break;
    default:
      Icon = FiBook;
  }

  return (
    <div
      className={cn(
        "p-2 border-gray-200 w-full flex flex-col hover:bg-indigo-50 dark:hover:bg-[#2a2a2a] group cursor-pointer h-[40px] flex-shrink-0 justify-center border-t"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 max-w-[calc(100%-24px)] overflow-hidden">
          <div className={iconColor}>
            <Icon size={15} />
          </div>
          <span className="text-sm truncate" title={title}>
            {title}
          </span>
        </div>
        <FiChevronDown
          size={19}
          className="text-gray-400 group-hover:text-gray-500 flex-shrink-0"
        />
      </div>
    </div>
  );
}
