type Filters = {
  hasSummary: string;
  combine: string;
  sortBy: string;
  sortOrder: string;
};

type AdminFiltersProps = {
  filters: Filters;
  onFilterChange: (key: string, value: string | number) => void;
};

export default function AdminFilters({ filters, onFilterChange }: AdminFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">필터</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">AI 요약</label>
          <select
            value={filters.hasSummary}
            onChange={(e) => onFilterChange("hasSummary", e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">전체</option>
            <option value="true">있음</option>
            <option value="false">없음</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">정렬 기준</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="created_at">생성일</option>
            <option value="recommendation_count">추천 수</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">정렬 순서</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange("sortOrder", e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </div>
    </div>
  );
}