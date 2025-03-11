import { ToastProvider } from "@/providers/toast-provider";

export default function TodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToastProvider />
      <section>{children}</section>;
    </>
  );
}
