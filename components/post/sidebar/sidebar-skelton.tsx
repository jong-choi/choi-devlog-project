export function SidebarSkeleton() {
  const dummyLines = [
    "송희는 들어 보고 싶다기보다",
    "버려 보고 싶었다.",
    "빈 봉을 쏘아 올리며",
    "한 계절을 보냈다.",
    "하체의 힘이 봉에 제대로 전달됐을 때 울리는,",
    "‘탕’ 하는 경쾌한 소리.",
    "진동하는 봉 안에서",
    "작은 링과 티끌 같은 것들이 구르며 내는 메아리.",
    "쌀알을 부어 넣은 페트병,",
    "아버지가 흔드는 은단통,",
    "혹은 수학여행지의 바다에서 들었던",
    "파도가 쓸어가는 굵은 모래 소리.",
    "- 김기태, 『무겁고 높은』, 2022",
  ];

  return (
    <div className="space-y-2 animate-pulse">
      {dummyLines.map((text, i) => (
        <p
          key={i}
          className="h-[36px] px-3 py-2 text-sm font-medium text-color-base opacity-30 blur-sm select-none"
        >
          {text}
        </p>
      ))}
    </div>
  );
}
