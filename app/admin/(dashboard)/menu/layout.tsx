import { MenuTabs } from "./MenuTabs";

export default function AdminMenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Menú</h1>
        <MenuTabs />
      </div>
      {children}
    </div>
  );
}
