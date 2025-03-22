export function SidebarSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <h2 className="text-gray-900 dark:text-white font-semibold">{title}</h2>
      {items.map((item) => (
        <button
          key={item}
          className="block w-full text-left hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
