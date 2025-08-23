# TODO

\_EXAMAPLE 폴더는 멀티 에이전트를 이용한 예제입니다.
이제 당신은 api/multiagent라우트를 tools를 쓰지 않는 멀티에이전트로 변환할 것입니다.

랭크래프 노드는 다음과 같습니다.

START
↓
decision (어떤 기능으로 갈지 결정 : 사용자가 타입을 "search", "summary", "chat" 과 같이 보냄)
↓
조건부 분기 (선택된 타입에 따라)
├─→ search - search api를 조회하고, 그 조회 결과를 프롬프트에 포함하여 hyperclova가 응답 생성
├─→ summary - summary api를 조회하고, 그 조회 결과를 그대로 응답
└─→ chat - hyperclova가 응답 생성
↓
finish (결과 수집 및 이벤트 발생)
↓
END

search는 api 조회와 응답 생성이 같이 있어 복잡합니다.

이해 되셨나요?

tools가 아닌 랭그래프입니다.

이후 /multiagent랑 연동한 후, multiagent에서는 타입을 같이 보내도록 ui를 수정하면 됩니다.
