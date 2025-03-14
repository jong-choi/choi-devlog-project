"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Home, Folder, BarChart3, Database, Settings } from "lucide-react";

const LeftSidebar = () => {
  const [active, setActive] = useState("Experiments");

  const menuItems = [
    { name: "Dashboard", icon: Home },
    { name: "Experiments", icon: Folder },
    { name: "Datasets", icon: Database },
    { name: "Reports", icon: BarChart3 },
    { name: "Metrics", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#F7F6F3] flex flex-col justify-between px-4 py-6 text-gray-700">
      <div>
        <div className="text-2xl font-semibold px-4 pb-4 mb-4 border-b">
          AppName
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition",
                active === item.name && "bg-gray-200 font-semibold"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-300 pt-4 px-4">
        <div className="text-sm text-gray-700 mb-3">£209.45</div>
        <button className="w-full py-2 px-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition">
          + Credits
        </button>
        <button className="mt-3 w-full flex items-center gap-2 text-sm text-gray-600">
          <Settings className="w-5 h-5" /> Settings
        </button>
      </div>
    </aside>
  );
};

export default LeftSidebar;
