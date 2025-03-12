interface PanelItemProps {
  onClick: () => void;
  description: string;
  isSelected: boolean;
}

export default function PanelItem({
  onClick,
  description,
  isSelected,
}: PanelItemProps) {
  return (
    <div className="mb-2">
      <button
        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
          isSelected ? "font-bold" : ""
        }`}
        onClick={onClick}
      >
        {description}
      </button>
    </div>
  );
}
