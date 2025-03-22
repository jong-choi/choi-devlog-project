import AutosaveIndicator from "@/components/post/main/post-controller/autosave/autosave-indicator";
import AutosaveLoader from "@/components/post/main/post-controller/autosave/autosave-loader";

export default function PostControllerWrapper() {
  return (
    <>
      <AutosaveLoader />
      <AutosaveIndicator />
    </>
  );
}
