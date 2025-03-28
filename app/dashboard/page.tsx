// app/dashboard/page.tsx

import { Sidebar } from "@/app/dashboard/post-sidebar";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 border-b flex items-center px-4 bg-white">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
      </div>
    </div>
  );
}
