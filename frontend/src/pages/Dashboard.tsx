import { Spinner, Button, Card, CardBody } from "@heroui/react";
import { User, Sun, Sunset, Moon, MapPin, Shield } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSlots, useBookings } from "../hooks/useData";

interface DashboardProps {
  courts: any[];
  onBookingClick: (booking: any) => void;
}

export const Dashboard = ({ courts, onBookingClick }: DashboardProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [activeFilter, setActiveFilter] = useState("afternoon");
  const { data: slotsData, isLoading: isLoadingSlots } = useSlots();
  const { data: bookingsData, isLoading: isLoadingBookings } =
    useBookings(selectedDate);
  const slots = slotsData?.data || [];
  const dashboardBookings = bookingsData?.data || [];

  // Generar 7 días anteriores y 14 días posteriores para el selector de fecha
  const days = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 7 + i);
      return {
        full: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("es-ES", { weekday: "short" }),
        dayNum: date.getDate(),
        monthName: date.toLocaleDateString("es-ES", { month: "long" }),
        year: date.getFullYear(),
      };
    });
  }, []);

  const selectedMonthYear = useMemo(() => {
    const d = days.find((d) => d.full === selectedDate) || days[0];
    return `${d.monthName} ${d.year}`;
  }, [selectedDate, days]);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot: any) => {
      const startHour = parseInt(slot.startTime.split(":")[0]);
      if (activeFilter === "morning") return startHour < 12;
      if (activeFilter === "afternoon")
        return startHour >= 12 && startHour < 18;
      if (activeFilter === "night") return startHour >= 18;
      return true;
    });
  }, [slots, activeFilter]);

  const getSlotBookings = (slotId: string, courtId: string) => {
    return dashboardBookings.filter(
      (b: any) =>
        b.date.startsWith(selectedDate) &&
        b.court?._id === courtId &&
        b.timeSlot?._id === slotId,
    );
  };

  // Auto-scroll to today on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const selectedEl = scrollRef.current.querySelector(
          '[data-selected="true"]',
        );
        if (selectedEl) {
          selectedEl.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
              Padel Central
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#a3ff33]"></div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                WhatsApp Sincronizado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Selección de Fecha */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            Seleccionar Fecha
          </h3>
          <span className="text-xs font-bold text-primary capitalize">
            {selectedMonthYear}
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide pt-6"
        >
          {days.map((day) => {
            const isSelected = day.full === selectedDate;
            const isToday = day.full === new Date().toISOString().split("T")[0];
            return (
              <button
                key={day.full}
                data-selected={isSelected}
                onClick={() => setSelectedDate(day.full)}
                className={`flex flex-col items-center justify-center min-w-[70px] h-[100px] rounded-[24px] border transition-all duration-300 relative ${
                  isSelected
                    ? "bg-primary border-primary shadow-[0_0_20px_rgba(163,255,51,0.3)] scale-105 z-10"
                    : "bg-dark-100 border-white/5 opacity-80"
                }`}
              >
                {isToday && (
                  <span
                    className={`absolute -top-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isSelected ? "bg-black text-primary" : "bg-primary text-black"}`}
                  >
                    Hoy
                  </span>
                )}
                <span
                  className={`text-xs font-bold mb-1 ${isSelected ? "text-black/60" : "text-gray-500"}`}
                >
                  {day.dayName}
                </span>
                <span
                  className={`text-2xl font-black ${isSelected ? "text-black" : "text-white"}`}
                >
                  {day.dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Filters */}
      <div className="flex gap-3">
        {[
          { id: "morning", label: "Mañana", icon: Sun },
          { id: "afternoon", label: "Tarde", icon: Sunset },
          { id: "night", label: "Noche", icon: Moon },
        ].map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "solid" : "flat"}
            className={`flex-grow h-14 rounded-full font-bold transition-all ${
              activeFilter === filter.id
                ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "bg-dark-100 text-gray-400"
            }`}
            onClick={() => setActiveFilter(filter.id)}
            startContent={<filter.icon size={20} />}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Sección Turnos Disponibles */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
          Turnos Disponibles
        </h3>

        {isLoadingSlots || isLoadingBookings ? (
          <div className="flex justify-center py-12">
            <Spinner color="primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {courts.map((court: any) => (
              <div key={court._id} className="space-y-3">
                <div className="flex items-center gap-2 pl-1">
                  <MapPin size={12} className="text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {court.name}
                  </span>
                </div>
                {filteredSlots.map((slot: any) => {
                  const slotBookings = getSlotBookings(slot._id, court._id);
                  const activeBooking = slotBookings.find(
                    (b: any) => b.status !== "cancelado",
                  );
                  const cancelledBookings = slotBookings.filter(
                    (b: any) => b.status === "cancelado",
                  );

                  const isTaken =
                    !!activeBooking && activeBooking.status !== "suspendido";
                  const isSuspended =
                    !!activeBooking && activeBooking.status === "suspendido";
                  const isPast =
                    new Date(selectedDate + "T23:59:59") < new Date();

                  return (
                    <Card
                      key={`${court._id}-${slot._id}`}
                      className={`bg-dark-100 border transition-all ${
                        isTaken || (isPast && !isTaken) || isSuspended
                          ? "opacity-50 border-white/5 grayscale-[0.5]"
                          : "border-white/5 hover:border-primary/30"
                      } ${isSuspended ? "border-red-500/30 bg-red-500/5" : ""}`}
                    >
                      <CardBody className="p-4 flex flex-row items-center gap-4">
                        <div
                          className={`flex flex-col items-center min-w-[60px] p-2 bg-dark-200 rounded-2xl border ${isSuspended ? "border-red-500/20" : "border-white/5"}`}
                        >
                          <span
                            className={`text-lg font-black ${isSuspended ? "text-red-500" : "text-white"}`}
                          >
                            {slot.startTime}
                          </span>
                          <span className="text-[8px] font-bold text-gray-500 uppercase">
                            {parseInt(slot.startTime.split(":")[0]) < 12
                              ? "AM"
                              : "PM"}
                          </span>
                        </div>

                        <div className="flex-grow">
                          <h4
                            className={`font-bold ${isTaken || (isPast && !isTaken) || isSuspended ? "line-through text-gray-500" : "text-white"}`}
                          >
                            {court.name}
                          </h4>
                          <p
                            className={`text-[10px] ${isSuspended ? "text-red-500/70" : "text-gray-500"} font-bold uppercase mt-0.5`}
                          >
                            {isSuspended
                              ? "⚠️ TURNO SUSPENDIDO"
                              : "90 mins • Nivel: Todos"}
                          </p>
                          {isTaken && (
                            <div className="flex items-center gap-1 mt-1">
                              <User size={10} className="text-gray-600" />
                              <span className="text-[10px] text-gray-600 font-bold">
                                Res. por {activeBooking.clientName}
                              </span>
                            </div>
                          )}
                          {!isTaken && isPast && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase">
                                No disponible (Pasado)
                              </span>
                            </div>
                          )}
                          {!isTaken &&
                            !isSuspended &&
                            !isPast &&
                            cancelledBookings.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-red-500/80 font-bold uppercase tracking-widest">
                                  ❌ Cancelado por{" "}
                                  {cancelledBookings[0].clientName}
                                </span>
                              </div>
                            )}
                        </div>

                        {isSuspended ? (
                          <Button
                            size="sm"
                            className="bg-red-500/20 text-red-500 font-black rounded-xl uppercase px-4 hover:bg-red-500/30"
                            onClick={() => onBookingClick(activeBooking)}
                          >
                            Habilitar
                          </Button>
                        ) : isTaken ? (
                          <Button
                            size="sm"
                            className="bg-dark-200 text-gray-500 font-black rounded-xl uppercase px-4 hover:bg-white/5"
                            onClick={() => onBookingClick(activeBooking)}
                          >
                            Detalles
                          </Button>
                        ) : isPast ? (
                          <Button
                            size="sm"
                            disabled
                            className="bg-dark-200 text-gray-400 font-black rounded-xl uppercase px-4 cursor-default"
                          >
                            Expirado
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              isIconOnly
                              variant="flat"
                              className="bg-white/5 text-gray-500 rounded-xl"
                              onClick={() =>
                                onBookingClick({
                                  status: "suspendido",
                                  court,
                                  timeSlot: slot,
                                  date: selectedDate,
                                  clientName: "SISTEMA",
                                  clientPhone: "MANTENIMIENTO",
                                  finalPrice: 0,
                                })
                              }
                            >
                              <Shield size={16} />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-primary text-black font-black rounded-xl uppercase px-6 shadow-lg shadow-primary/20"
                              onClick={() =>
                                onBookingClick({
                                  status: "disponible",
                                  court,
                                  timeSlot: slot,
                                  date: selectedDate,
                                })
                              }
                            >
                              Reservar
                            </Button>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            ))}

            {filteredSlots.length === 0 && (
              <p className="text-center text-gray-600 py-10 font-bold italic">
                No se encontraron turnos para este horario.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
