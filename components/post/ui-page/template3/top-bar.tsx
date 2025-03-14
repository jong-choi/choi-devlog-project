const TopNavbar = () => {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-300 p-4 flex items-center justify-between">
      <div className="text-lg font-semibold text-gray-800">AppName</div>
      <div className="w-1/3">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative">
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          🔔
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 font-semibold">
          A
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
