```
graph TB
    START([START])
    ROUTING{<br/>Routing Node<br/>━━━━━━━━━━━━━<br/>• 조건부 라우팅}
    SUMMARY[<br/>Fetch Node<br/>━━━━━━━━━━━━━<br/>• post_id로 요약 조회<br/>• 조회 결과를 상태에 저장]
    GOOGLE[<br/>Google Node<br/>━━━━━━━━━━━━━<br/>• 웹 검색 실행<br/>• 검색 결과를 상태에 저장]
    CHAT[<br/>Chat Node<br/>━━━━━━━━━━━━━<br/>• Ollama 호출 <br/>• 상태를 기반으로 응답 생성]


    END([END])

    START --> ROUTING
    ROUTING -->|포스트 ID 변경| SUMMARY
    ROUTING -->|검색 요청| GOOGLE
    ROUTING -->|응답 생성| CHAT

    ROUTING --> |종료| END

    CHAT --> ROUTING
    GOOGLE --> ROUTING
    SUMMARY --> ROUTING

    classDef chatStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef googleStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    classDef summaryStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:3px,color:#000
    classDef routingStyle fill:#fff3e0,stroke:#f57c00,stroke-width:3px,color:#000
    classDef startEndStyle fill:#ffebee,stroke:#d32f2f,stroke-width:3px,color:#000

    class START,END startEndStyle
    class ROUTING routingStyle
    class CHAT chatStyle
    class GOOGLE googleStyle
    class SUMMARY summaryStyle
```
