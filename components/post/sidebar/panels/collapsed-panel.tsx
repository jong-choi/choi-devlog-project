import { FiBookOpen, FiChevronDown } from "react-icons/fi";
import { FiBook } from "react-icons/fi";
import { PiBooks } from "react-icons/pi";
import { Panel } from "@/types/post";

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
      className="p-2 border-gray-200 bg-white w-full flex flex-col hover:bg-slate-50 group cursor-pointer h-[40px] justify-center"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={iconColor}>
            <Icon size={19} />
          </div>
          <span className="text-sm">{title}</span>
        </div>
        <FiChevronDown
          size={19}
          className="text-gray-400 group-hover:text-gray-500"
        />
      </div>
    </div>
  );
}
