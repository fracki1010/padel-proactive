import { Input, Tabs, Tab, Card, CardBody } from "@heroui/react";
import { Search } from "lucide-react";
import { useCourts } from "../hooks/useData";

interface DashboardControlsProps {
  filterValue: string;
  onFilterChange: (value: string) => void;
  stats?: { label: string; value: string }[];
  selectedCourt?: string;
  onCourtChange?: (courtId: string) => void;
  showTabs?: boolean;
  showStats?: boolean;
}

export const DashboardControls = ({
  filterValue,
  onFilterChange,
  stats = [
    { label: "OCUPACIÓN", value: "0%" },
    { label: "CANCHAS LIBRES", value: "0" },
  ],
  selectedCourt = "all",
  onCourtChange,
  showTabs = true,
  showStats = true,
}: DashboardControlsProps) => {
  const { data: courtsData } = useCourts();
  const courts = courtsData?.data || [];

  return (
    <div className="space-y-6 w-full">
      {/* Search Bar */}
      <Input
        isClearable
        placeholder="Buscar por nombre o teléfono..."
        startContent={<Search size={20} className="text-gray-400" />}
        value={filterValue}
        onValueChange={onFilterChange}
        className="max-w-full"
        classNames={{
          inputWrapper: "bg-dark-100/50 border-none h-14 rounded-2xl",
          input: "text-white placeholder:text-gray-500",
        }}
      />

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-dark-200 border border-white/5 h-24"
            >
              <CardBody className="p-4 flex flex-col justify-center">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Court Selection Tabs */}
      {showTabs && (
        <Tabs
          aria-label="Selección de Cancha"
          variant="underlined"
          selectedKey={selectedCourt}
          onSelectionChange={(key) => onCourtChange?.(key as string)}
          classNames={{
            base: "w-full overflow-x-auto",
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-white/5",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent:
              "group-data-[selected=true]:text-primary font-bold text-gray-500",
          }}
        >
          <Tab key="all" title="Todas" />
          {courts.map((court) => (
            <Tab key={court._id} title={court.name} />
          ))}
        </Tabs>
      )}
    </div>
  );
};
