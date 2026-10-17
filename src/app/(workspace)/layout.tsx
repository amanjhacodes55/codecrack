import Navbar from "@/components/Navbar";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden">
      <Navbar compact />
      {children}
    </div>
  );
}
