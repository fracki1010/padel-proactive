import { useState, useEffect, useMemo } from "react";
import {
  Avatar,
  Button as HeroButton,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Switch,
  addToast,
} from "@heroui/react";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { BookingForm } from "./components/BookingForm";
import {
  useBookings,
  useCourts,
  useCreateBooking,
  useDeleteBooking,
  useUpdateBooking,
  useNotifications,
  useMarkAllRead,
} from "./hooks/useData";
import { formatDate } from "./utils/formatters";
import {
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  MapPin,
  X,
  CreditCard,
  Bell,
  CheckCheck,
} from "lucide-react";
import { getInitials, getAvatarColor } from "./utils/avatarUtils";

import { Dashboard, Clients, Bookings, Finance, Profile, Login } from "./pages";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [filterValue, setFilterValue] = useState("");
  const [activeTab, setActiveTab] = useState("panel");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("all");

  const createBooking = useCreateBooking();
  const deleteBooking = useDeleteBooking();
  const updateBooking = useUpdateBooking();
  const { data: notificationsData } = useNotifications();
  const markAllRead = useMarkAllRead();

  // Drawer para detalles de reserva
  const {
    isOpen: isBookingDetailOpen,
    onOpen: onBookingDetailOpen,
    onOpenChange: onBookingDetailOpenChange,
  } = useDisclosure();

  // Drawer para el perfil / ajustes
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onOpenChange: onProfileOpenChange,
  } = useDisclosure();

  // Drawer para notificaciones
  const {
    isOpen: isNotifOpen,
    onOpen: onNotifOpen,
    onOpenChange: onNotifOpenChange,
  } = useDisclosure();

  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data, isLoading } = useBookings();
  const { data: courtsData } = useCourts();
  const bookings = data?.data || [];
  const courts = courtsData?.data || [];

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking);
    if (booking.status === "disponible") {
      setIsCreating(true);
      return;
    }

    if (booking.status === "suspendido" && !booking._id) {
      createBooking.mutate(
        {
          ...booking,
          court: booking.court._id,
          timeSlot: booking.timeSlot._id,
          paymentStatus: "pagado",
          finalPrice: 0,
          clientName: "SISTEMA",
          clientPhone: "MANTENIMIENTO",
        },
        {
          onSuccess: () => {
            addToast({ title: "Turno suspendido bloqueado", color: "success" });
          },
          onError: () => {
            addToast({ title: "Error al suspender turno", color: "danger" });
          },
        },
      );
      return;
    }

    onBookingDetailOpen();
  };

  const renderContent = () => {
    if (isCreating)
      return (
        <BookingForm
          initialData={selectedBooking}
          onCancel={() => {
            setIsCreating(false);
            setSelectedBooking(null);
          }}
        />
      );

    switch (activeTab) {
      case "panel":
        return (
          <Dashboard courts={courts} onBookingClick={handleBookingClick} />
        );
      case "socios":
        return (
          <Clients filterValue={filterValue} onFilterChange={setFilterValue} />
        );
      case "reservas":
        return (
          <Bookings
            bookings={bookings}
            courts={courts}
            isLoading={isLoading}
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            selectedCourt={selectedCourt}
            onCourtChange={setSelectedCourt}
            onBookingClick={handleBookingClick}
          />
        );
      case "caja":
        return <Finance bookings={bookings} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (isCreating) return "Nueva Reserva";
    switch (activeTab) {
      case "panel":
        return "Panel Principal";
      case "socios":
        return "Socios";
      case "reservas":
        return "Turnos";
      case "caja":
        return "Caja";
      default:
        return "Padel Pro";
    }
  };

  const unreadCount = useMemo(() => {
    if (!notificationsData?.data || !Array.isArray(notificationsData.data))
      return 0;
    return notificationsData.data.filter((n: any) => n.isRead === false).length;
  }, [notificationsData]);

  useEffect(() => {
    console.log("🔔 Notificaciones actualizadas:", {
      total: notificationsData?.data?.length || 0,
      unread: unreadCount,
      data: notificationsData?.data,
    });
  }, [notificationsData, unreadCount]);

  if (isAuthLoading) return null;
  if (!token) return <Login />;

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans pb-32">
      <Navbar
        title={getTitle()}
        onAvatarClick={onProfileOpen}
        onBellClick={onNotifOpen}
        notificationCount={unreadCount}
      />
      <main className="flex-grow p-6 max-w-lg mx-auto w-full relative">
        {renderContent()}
      </main>
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab: string) => {
          if (tab === "fab") setIsCreating(true);
          else {
            setActiveTab(tab);
            setIsCreating(false);
          }
        }}
      />

      {/* Drawer: Detalles de Reserva */}
      <Drawer
        isOpen={isBookingDetailOpen}
        size="3xl"
        hideCloseButton
        onOpenChange={onBookingDetailOpenChange}
        placement="bottom"
        backdrop="blur"
        classNames={{
          base: "rounded-t-[3rem] bg-dark-200 border-t border-white/10",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1 p-8 text-center">
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6"></div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                  Detalles del Turno
                </h2>
              </DrawerHeader>
              <DrawerBody className="p-8 pb-12 space-y-8">
                <div className="flex gap-4 p-4 bg-dark-100 rounded-3xl border border-white/5 items-center">
                  <Avatar
                    name={getInitials(selectedBooking?.clientName)}
                    className="w-20 h-20 rounded-2xl shadow-xl shadow-black/40 text-2xl font-black text-white"
                    style={{
                      backgroundColor: getAvatarColor(
                        selectedBooking?.clientName,
                      ),
                    }}
                  />
                  <div>
                    <h3 className="text-2xl font-black text-white leading-tight">
                      {selectedBooking?.clientName}
                    </h3>
                    <p className="text-primary font-bold flex items-center gap-2 mt-1">
                      <Phone size={14} /> {selectedBooking?.clientPhone}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-100 rounded-3xl border border-white/5 flex flex-col gap-1">
                    <Calendar size={18} className="text-gray-500 mb-1" />
                    <span className="text-[10px] text-gray-500 font-black uppercase">
                      FECHA
                    </span>
                    <span className="text-white font-bold">
                      {selectedBooking && formatDate(selectedBooking.date)}
                    </span>
                  </div>
                  <div className="p-4 bg-dark-100 rounded-3xl border border-white/5 flex flex-col gap-1">
                    <Clock size={18} className="text-gray-500 mb-1" />
                    <span className="text-[10px] text-gray-500 font-black uppercase">
                      HORARIO
                    </span>
                    <span className="text-white font-bold">
                      {selectedBooking?.timeSlot?.startTime} -{" "}
                      {selectedBooking?.timeSlot?.endTime}
                    </span>
                  </div>
                  <div className="p-4 bg-dark-100 rounded-3xl border border-white/5 flex flex-col gap-1 col-span-2">
                    <MapPin size={18} className="text-gray-500 mb-1" />
                    <span className="text-[10px] text-gray-500 font-black uppercase">
                      CANCHA
                    </span>
                    <span className="text-white font-bold">
                      {selectedBooking?.court?.name}
                    </span>
                  </div>

                  <div className="p-4 bg-dark-100 rounded-3xl border border-white/5 flex items-center justify-between col-span-2">
                    <div className="flex gap-4 items-center">
                      <div
                        className={`w-12 h-12 ${selectedBooking?.paymentStatus === "pagado" ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-500"} rounded-2xl flex items-center justify-center`}
                      >
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-black uppercase block">
                          PAGO
                        </span>
                        <span
                          className={`font-bold ${selectedBooking?.paymentStatus === "pagado" ? "text-primary" : "text-white"}`}
                        >
                          {selectedBooking?.paymentStatus === "pagado"
                            ? "COBRADO"
                            : "PENDIENTE"}
                        </span>
                      </div>
                    </div>
                    <Switch
                      isSelected={selectedBooking?.paymentStatus === "pagado"}
                      onValueChange={(val) => {
                        const newStatus = val ? "pagado" : "pendiente";
                        updateBooking.mutate(
                          {
                            id: selectedBooking._id,
                            data: { paymentStatus: newStatus },
                          },
                          {
                            onSuccess: (response) => {
                              setSelectedBooking(response.data);
                              addToast({
                                title: "Estado de pago actualizado",
                                color: "success",
                              });
                            },
                            onError: () => {
                              addToast({
                                title: "Error al actualizar estado",
                                color: "danger",
                              });
                            },
                          },
                        );
                      }}
                      color="primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {selectedBooking?.status === "suspendido" ? (
                    <HeroButton
                      className="h-16 bg-red-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-red-500/20"
                      onPress={() => {
                        deleteBooking.mutate(selectedBooking._id, {
                          onSuccess: () => {
                            addToast({
                              title: "Turno liberado correctamente",
                              color: "success",
                            });
                            onBookingDetailOpenChange();
                          },
                          onError: () => {
                            addToast({
                              title: "Error al liberar turno",
                              color: "danger",
                            });
                          },
                        });
                      }}
                    >
                      HABILITAR TURNO
                    </HeroButton>
                  ) : (
                    <HeroButton
                      className="h-16 bg-primary text-black font-black text-lg rounded-2xl shadow-xl shadow-primary/20"
                      onPress={() =>
                        window.open(
                          `https://wa.me/${selectedBooking?.clientPhone.replace(/\D/g, "")}`,
                          "_blank",
                        )
                      }
                    >
                      <MessageSquare size={20} /> ENVIAR WHATSAPP
                    </HeroButton>
                  )}
                  <HeroButton
                    variant="flat"
                    className="h-16 text-white bg-white/5 rounded-2xl font-bold"
                    onPress={onClose}
                  >
                    Cerrar Detalle
                  </HeroButton>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Drawer: Perfil y Ajustes */}
      <Drawer
        isOpen={isProfileOpen}
        size="full"
        hideCloseButton
        onOpenChange={onProfileOpenChange}
        placement="bottom"
        backdrop="blur"
        classNames={{
          base: "rounded-t-[3rem] bg-dark-200 border-t border-white/10",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-row items-center justify-between p-8 text-center pb-0">
                <div className="w-10 h-10"></div>{" "}
                {/* Spacer to center the pill */}
                <HeroButton
                  isIconOnly
                  variant="flat"
                  className="bg-white/5 text-white rounded-2xl"
                  onPress={onClose}
                >
                  <X size={20} />
                </HeroButton>
              </DrawerHeader>
              <DrawerBody className="p-8 pt-0 overflow-y-auto">
                <Profile courts={courts} />
                <HeroButton
                  variant="flat"
                  className="h-16 text-white bg-white/5 rounded-3xl font-bold mb-6"
                  onPress={onClose}
                >
                  Volver al Panel
                </HeroButton>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
      {/* Drawer: Notificaciones */}
      <Drawer
        isOpen={isNotifOpen}
        size="full"
        hideCloseButton
        onOpenChange={onNotifOpenChange}
        placement="bottom"
        backdrop="blur"
        classNames={{
          base: "rounded-t-[3rem] bg-dark-200 border-t border-white/10",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-row items-center justify-between p-8 text-center pb-0">
                <div className="flex flex-col items-start">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Notificaciones
                  </h2>
                  <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">
                    Alertas del Sistema
                  </p>
                </div>
                <div className="flex gap-2">
                  <HeroButton
                    isIconOnly
                    variant="flat"
                    className="bg-white/5 text-white rounded-2xl"
                    onPress={() => markAllRead.mutate()}
                  >
                    <CheckCheck size={20} />
                  </HeroButton>
                  <HeroButton
                    isIconOnly
                    variant="flat"
                    className="bg-white/5 text-white rounded-2xl"
                    onPress={onClose}
                  >
                    <X size={20} />
                  </HeroButton>
                </div>
              </DrawerHeader>
              <DrawerBody className="p-8 pb-32 overflow-y-auto">
                <div className="flex flex-col gap-4">
                  {!notificationsData?.data?.length && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                      <Bell size={48} className="mb-4" />
                      <p className="font-bold uppercase tracking-widest text-xs">
                        No hay notificaciones
                      </p>
                    </div>
                  )}
                  {notificationsData?.data?.map((n: any) => (
                    <div
                      key={n._id}
                      className={`p-6 rounded-[2rem] border transition-all ${
                        n.isRead
                          ? "bg-white/5 border-white/5 opacity-60"
                          : "bg-primary/10 border-primary/20 shadow-[0_0_20px_rgba(163,255,51,0.1)]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            n.type === "new_booking"
                              ? "bg-primary text-black"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {n.type === "new_booking"
                            ? "Nueva Reserva"
                            : "Sistema"}
                        </span>
                        <span className="text-[10px] font-bold text-white/30">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white mb-1 tracking-tight">
                        {n.title}
                      </h4>
                      <p className="text-sm font-medium text-white/60 leading-relaxed whitespace-pre-line">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
