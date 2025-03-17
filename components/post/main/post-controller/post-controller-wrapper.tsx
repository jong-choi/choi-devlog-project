import AutosaveIndicator from "@/components/post/main/post-controller/autosave/autosave-indicator";
import AutosaveLoader from "@/components/post/main/post-controller/autosave/autosave-loader";

export default function PostControllerWrapper() {
  return (
    <>
      <div>헬로</div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Enter your email address.
      </p>
      <AutosaveLoader />
      <AutosaveIndicator />
    </>
  );
}
