import { Outlet } from "react-router";
import { CollectionProvider } from "../lib/collection-store";
import { Toaster } from "sonner";

export function RootWrapper() {
  return (
    <CollectionProvider>
      <Outlet />
      <Toaster position="top-right" theme="dark" />
    </CollectionProvider>
  );
}
