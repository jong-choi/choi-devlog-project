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
  let iconColor = "text-blue-600";

  switch (icon) {
    case "category":
      Icon = PiBooks;
      iconColor = "text-red-600";
      break;
    case "subcategory":
      Icon = FiBookOpen;
      iconColor = "text-green-600";
      break;
    case "post":
      Icon = FiBook;
      iconColor = "text-blue-600";
      break;
    default:
      Icon = FiBook;
      iconColor = "text-blue-600";
  }

  return (
    <div
      className={cn(
        "p-2 border-gray-200 w-full flex flex-col hover:bg-gray-100 dark:hover:bg-[#2a2a2a] group cursor-pointer h-[40px] flex-shrink-0 justify-center border-t"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 max-w-[calc(100%-24px)] overflow-hidden">
          <div className={iconColor}>
            <Icon size={19} />
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
