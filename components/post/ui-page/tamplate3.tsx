import LeftSidebar from "@/components/post/ui-page/template3/left-sidbar";
import RightSection from "@/components/post/ui-page/template3/right-section";
import TopNavbar from "@/components/post/ui-page/template3/top-bar";

export default function Template3() {
  return (
    <div className="flex flex-col h-screen">
      <TopNavbar />
      <div className="flex flex-1 bg-gray-100">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold">Set up your experiment</h1>
          <p className="text-gray-600">
            Lorem ipsum is placeholder text commonly used in the graphic.
          </p>

          <div className="mt-6">
            <label className="text-sm font-semibold">Select Dataset</label>
            <input
              type="text"
              placeholder="Search dataset..."
              className="w-full p-2 border rounded-md mt-2"
            />

            <div className="mt-4 space-y-2">
              <div className="p-3 bg-gray-100 flex justify-between rounded-md">
                ODAQ (DE) <button className="text-red-500">🗑</button>
              </div>
              <div className="p-3 bg-gray-100 flex justify-between rounded-md">
                ODAQ (Training) <button className="text-red-500">🗑</button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold">Version</label>
            <select className="w-full p-2 border rounded-md mt-2">
              <option>Latest</option>
              <option>Previous</option>
            </select>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold">Name</label>
            <input
              type="text"
              placeholder="MUSHRA"
              className="w-full p-2 border rounded-md mt-2"
            />
          </div>

          <div className="mt-6 flex justify-between">
            <button className="py-2 px-4 border rounded-md">Back</button>
            <div>
              <button className="py-2 px-4 border rounded-md mr-2">
                Save as Draft
              </button>
              <button className="py-2 px-4 bg-green-500 text-white rounded-md">
                Continue →
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSection />
      </div>
    </div>
  );
}
