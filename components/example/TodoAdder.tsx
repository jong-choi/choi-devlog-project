import { createTodos } from "@/app/example/[userId]/actions";

export default function TodoAdder() {
  async function formAction(formData: FormData) {
    "use server";

    const content = formData.get("contentInput");
    if (typeof content !== "string") return; // Type Guard

    await createTodos(content);
    // 생성을 완료한 후 실행할 로직들을 이곳에 작성합니다.
  }

  return (
    <form action={formAction}>
      <input name="contentInput" placeholder="할 일을 적어라" />
      <button type="submit">할 일 추가</button>
    </form>
  );
}
