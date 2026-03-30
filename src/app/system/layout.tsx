import type { Metadata } from "next";
import LeftPanel from "../../components/left-panel";

export const metadata: Metadata = {
  title: "Hermes | Sistema",
};

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <LeftPanel />
      <main className="ml-64 flex-1 overflow-y-auto p-8">
        {children}
      </main>
      
    </div>
  );
}