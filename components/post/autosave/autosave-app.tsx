import AutosaveIndicator from "@/components/post/autosave/autosave-indicator";
import AutosaveLoader from "@/components/post/autosave/autosave-loader";

export default function AutosaveApp() {
  return (
    <>
      <AutosaveLoader />
      <AutosaveIndicator />
    </>
  );
}
