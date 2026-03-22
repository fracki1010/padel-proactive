import { Spinner } from "@heroui/react";
import { DashboardControls } from "../components/FilterSidebar";
import { BookingCard } from "../components/BookingCard";
import { formatDate } from "../utils/formatters";
import { HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface BookingsProps {
  bookings: any[];
  courts: any[];
  isLoading: boolean;
  filterValue: string;
  onFilterChange: (val: string) => void;
  selectedCourt: string;
  onCourtChange: (val: string) => void;
  onBookingClick: (booking: any) => void;
}

export const Bookings = ({
  bookings,
  courts,
  isLoading,
  filterValue,
  onFilterChange,
  selectedCourt,
  onCourtChange,
  onBookingClick,
}: BookingsProps) => {
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking: any) => {
        const searchStr = filterValue.toLowerCase();
        const matchesSearch =
          booking.clientName?.toLowerCase().includes(searchStr) ||
          booking.clientPhone?.includes(searchStr) ||
          (booking.court?.name || "").toLowerCase().includes(searchStr);

        const matchesCourt =
          selectedCourt === "all" || booking.court?._id === selectedCourt;

        return matchesSearch && matchesCourt;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return (a.timeSlot?.startTime || "").localeCompare(
          b.timeSlot?.startTime || "",
        );
      });
  }, [bookings, filterValue, selectedCourt]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaysBookings = bookings.filter((b: any) =>
      b.date.startsWith(today),
    );

    const totalSlots = (courts.length || 1) * 8;
    const occupiedSlots = todaysBookings.length;
    const occupation =
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
    const freeSlots = totalSlots - occupiedSlots;

    return [
      { label: "OCUPACIÓN HOY", value: `${occupation}%` },
      { label: "TURNOS LIBRES", value: Math.max(0, freeSlots).toString() },
    ];
  }, [bookings, courts]);

  const groupedBookings = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredBookings.forEach((booking: any) => {
      const dateKey = new Date(booking.date).toISOString().split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(booking);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredBookings]);

  // Infinite scroll: mostrar de a 5 grupos de fechas
  const { visibleCount, sentinelRef, hasMore } = useInfiniteScroll(
    5,
    4,
    groupedBookings.length,
  );

  const visibleGroups = groupedBookings.slice(0, visibleCount);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-2">
          Turnos Históricos
        </h1>
        <p className="text-gray-500 text-sm">Registro de todas las reservas</p>
      </div>

      <DashboardControls
        filterValue={filterValue}
        onFilterChange={onFilterChange}
        stats={stats}
        selectedCourt={selectedCourt}
        onCourtChange={onCourtChange}
      />

      <div className="space-y-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Spinner size="lg" color="primary" />
          </div>
        ) : groupedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-dark-200 rounded-3xl border border-white/5">
            <HelpCircle size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-1 text-white">No hay turnos</h3>
            <p className="text-gray-500 text-sm">No se encontraron reservas.</p>
          </div>
        ) : (
          <>
            {visibleGroups.map(([dateKey, group]) => (
              <div key={dateKey} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    {formatDate(dateKey)}
                  </h2>
                  <div className="h-[1px] flex-grow bg-white/5"></div>
                </div>
                <div className="space-y-4">
                  {group.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onClick={onBookingClick}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Sentinel para infinite scroll */}
            <div ref={sentinelRef} className="py-2">
              {hasMore && (
                <div className="flex justify-center py-6">
                  <Spinner color="primary" size="sm" />
                </div>
              )}
              {!hasMore && groupedBookings.length > 5 && (
                <p className="text-center text-gray-600 text-xs font-bold uppercase tracking-widest py-4">
                  {filteredBookings.length} reservas cargadas
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
