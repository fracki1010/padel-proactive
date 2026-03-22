import { Button } from "@heroui/react";
import { LayoutGrid, Calendar, Users, Wallet, Plus } from "lucide-react";
import { cn } from "@heroui/react";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNav = ({
  activeTab = "panel",
  onTabChange,
}: BottomNavProps) => {
  const tabs = [
    { id: "panel", label: "Panel", icon: LayoutGrid },
    { id: "reservas", label: "Reservas", icon: Calendar },
    { id: "fab", isFab: true },
    { id: "socios", label: "Socios", icon: Users },
    { id: "caja", label: "Caja", icon: Wallet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-200/90 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex items-center justify-between z-50">
      {tabs.map((tab) => {
        if (tab.isFab) {
          return (
            <div key="fab-container" className="relative -top-8">
              <Button
                isIconOnly
                size="lg"
                onClick={() => onTabChange?.("fab")}
                className="bg-primary text-black shadow-lg shadow-primary/40 w-16 h-16 rounded-full"
              >
                <Plus size={32} strokeWidth={3} />
              </Button>
            </div>
          );
        }

        const Icon = tab.icon!;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id!)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary" : "text-gray-500",
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {tab.label}
            </span>
            {isActive && (
              <div className="w-1 h-1 bg-primary rounded-full mt-0.5 shadow-sm shadow-primary"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};
