interface PanelItemProps {
  onClick: () => void;
  description: string;
  isSelected: boolean;
  className?: string;
}

export default function PanelItem({
  onClick,
  description,
  isSelected,
  className,
}: PanelItemProps) {
  return (
    <button
      className={`w-full text-left px-3 py-2 rounded hover:bg-indigo-100 hover:dark:bg-[#3a3a3a] ${
        isSelected ? "font-semibold dark:font-bold" : ""
      } ${className}`}
      onClick={onClick}
    >
      {description}
    </button>
  );
}
// bg-gray-200 dark:bg-[#3a3a3a]
