export default async function Page() {
  return (
    <div className="h-screen flex flex-col">
      {/* 🔹 상단바 (고정) */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md h-14 z-10">
        <span>Navbar</span>
      </nav>

      {/* 🔹 본문 Wrapper (상단바 제외한 높이 적용) */}
      <div className="flex flex-1 pt-14 h-[calc(100vh-56px)]">
        {/* 🔸 왼쪽 사이드바 (상단/중단/하단 3단 분할) */}
        <aside className="hidden lg:flex flex-col w-64 bg-gray-100 h-full">
          <div className="h-1/3 overflow-y-auto border-b p-4">
            <span className="block h-[200px] bg-red-200">
              Sidebar Top - Scroll Test
            </span>
          </div>
          <div className="h-1/3 overflow-y-auto border-b p-4">
            <span className="block h-[300px] bg-blue-200">
              Sidebar Middle - Scroll Test
            </span>
          </div>
          <div className="h-1/3 overflow-y-auto p-4">
            <span className="block h-[400px] bg-green-200">
              Sidebar Bottom - Scroll Test
            </span>
          </div>
        </aside>

        {/* 🔸 가운데 본문 (상단: 30px 고정, 하단: 남은 공간 + 개별 스크롤) */}
        <div className="flex flex-1 flex-col h-full">
          <section className="h-[30px] border-b flex items-center px-4 bg-gray-200">
            <span>Header</span>
          </section>
          <section className="flex-1 overflow-y-auto p-4">
            <span className="block h-[1000px] bg-yellow-200">
              Main Content - Scroll Test
            </span>
          </section>
        </div>

        {/* 🔸 오른쪽 패널 (스크롤 가능) */}
        <aside className="hidden lg:block w-72 bg-gray-50 overflow-y-auto p-4">
          <span className="block h-[600px] bg-purple-200">
            Right Panel - Scroll Test
          </span>
        </aside>
      </div>
    </div>
  );
}
