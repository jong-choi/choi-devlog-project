Next.js 14에서 OpenAI API를 연동하는 방법을 정리하면 다음과 같아:  

---

## **1. OpenAI API 키 발급**
1. [OpenAI 개발자 콘솔](https://platform.openai.com/signup/)에서 회원가입.
2. API 키 생성 (`sk-...`로 시작하는 문자열).
3. `.env.local`에 API 키 저장:
```env
OPENAI_API_KEY=your_openai_api_key
```

---

## **2. OpenAI API 설치**
```sh
npm install openai
```

---

## **3. Next.js API Route 설정 (`app/api/chat/route.ts`)**
```ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({ message: response.choices[0].message?.content });
  } catch (error) {
    return NextResponse.json({ error: "API 호출 중 오류 발생" }, { status: 500 });
  }
}
```
> **⚠️ 주의:** `API Route`는 기본적으로 서버에서 실행되므로, 환경 변수를 안전하게 사용할 수 있음.

---

## **4. 클라이언트에서 OpenAI API 호출**
```tsx
"use client";

import { useState } from "react";

export default function ChatComponent() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setResponse(data.message);
  };

  return (
    <div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSubmit}>Send</button>
      <p>Response: {response}</p>
    </div>
  );
}
```

---

## **5. 스트리밍 응답 처리 (더 자연스러운 채팅 경험)**
- OpenAI API는 스트리밍 기능을 지원하므로, `ReadableStream`을 활용해 점진적으로 데이터를 수신할 수 있음.
### **① API Route에서 스트리밍 응답 설정 (`app/api/chat-stream/route.ts`)**
```ts
import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    stream: true, // 스트리밍 활성화
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content || ""));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}
```

### **② 클라이언트에서 스트리밍 데이터 수신**
```tsx
"use client";

import { useState } from "react";

export default function ChatStreamComponent() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    setResponse("");
    
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
      headers: { "Content-Type": "application/json" },
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { value, done } = await reader?.read()!;
      if (done) break;
      setResponse((prev) => prev + decoder.decode(value));
    }
  };

  return (
    <div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSubmit}>Send</button>
      <p>Response: {response}</p>
    </div>
  );
}
```

---

## **6. 배포 및 환경 변수 설정**
- **Vercel에 배포할 경우**
  1. `vercel env add OPENAI_API_KEY`
  2. 환경 변수를 추가하고 `vercel --prod`로 배포.

- **Google Cloud Run 배포**
  ```sh
  gcloud run deploy nextjs-app --set-env-vars=OPENAI_API_KEY=your_api_key
  ```

---

이제 Next.js 14에서 OpenAI API를 활용할 수 있어!  
실시간 채팅, 요약 기능 등 다양한 기능을 추가할 수도 있어.  
추가로 다루고 싶은 부분이 있으면 말해줘. 😊