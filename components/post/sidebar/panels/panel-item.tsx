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
      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
        isSelected ? "font-bold" : ""
      } ${className}`}
      onClick={onClick}
    >
      {description}
    </button>
  );
}
