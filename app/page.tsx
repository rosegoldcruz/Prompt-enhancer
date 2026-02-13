import { Workspace } from "@/components/workspace";

export default function Page() {
  return (
    <main className="min-h-dvh bg-mesh px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <Workspace />
      </div>
    </main>
  );
}
