import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Switch,
  Input,
} from "@heroui/react";
import {
  MapPin,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  CreditCard,
  Target,
  ChevronLeft,
  Clock,
  Phone,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  useCourts,
  useUpdateCourt,
  useSlots,
  useUpdateSlot,
  useUpdateProfile,
} from "../hooks/useData";
import { useAuth } from "../context/AuthContext";

interface ProfileProps {
  courts: any[];
}

export const Profile = ({ courts: initialCourts }: ProfileProps) => {
  const { logout, user, updateUser } = useAuth();
  const [view, setView] = useState<"menu" | "courts" | "schedule">("menu");
  const { data: courtsData } = useCourts(true);
  const courts = courtsData?.data || initialCourts;
  const updateCourt = useUpdateCourt();
  const updateSlot = useUpdateSlot();
  const updateProfile = useUpdateProfile();
  const { data: slotsData } = useSlots(true);
  const slots = slotsData?.data || [];

  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  const handleUpdatePhone = () => {
    updateProfile.mutate(
      { phone: phoneNumber },
      {
        onSuccess: (response) => {
          updateUser(response.data);
        },
      },
    );
  };

  if (view === "courts") {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="flat"
            onClick={() => setView("menu")}
            className="bg-white/5 text-white rounded-2xl"
          >
            <ChevronLeft size={20} />
          </Button>
          <h3 className="text-xl font-black text-white uppercase italic">
            Mis Canchas
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {courts.map((court: any) => (
            <Card
              key={court._id}
              className="bg-dark-100 border border-white/5 rounded-[2rem]"
            >
              <CardBody className="p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${court.isActive ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-500"} rounded-2xl flex items-center justify-center transition-colors`}
                  >
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p
                      className={`font-bold ${court.isActive ? "text-white" : "text-gray-500"} text-lg transition-colors`}
                    >
                      {court.name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Estado: {court.isActive ? "Activa" : "Inactiva"}
                    </p>
                  </div>
                </div>
                <Switch
                  isSelected={court.isActive}
                  onValueChange={(val) =>
                    updateCourt.mutate({
                      id: court._id,
                      data: { isActive: val },
                    })
                  }
                  color="primary"
                  size="sm"
                />
              </CardBody>
            </Card>
          ))}
          <Button className="h-14 bg-primary text-black font-black rounded-2xl uppercase mt-4">
            Añadir Cancha
          </Button>
        </div>
      </div>
    );
  }

  if (view === "schedule") {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="flat"
            onClick={() => setView("menu")}
            className="bg-white/5 text-white rounded-2xl"
          >
            <ChevronLeft size={20} />
          </Button>
          <h3 className="text-xl font-black text-white uppercase italic">
            Horarios y Precios
          </h3>
        </div>

        <div className="space-y-4">
          <section className="bg-blue-500/10 p-6 rounded-[2.5rem] border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-blue-500" size={20} />
              <p className="font-bold text-blue-500 uppercase text-xs tracking-widest">
                Suspensión de Emergencia
              </p>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-4 leading-relaxed">
              Bloquea turnos específicos por lluvia o mantenimiento técnico.
            </p>
            <Button
              fullWidth
              variant="flat"
              className="bg-blue-500 text-white font-black rounded-2xl uppercase text-[10px]"
              startContent={<Clock size={14} />}
            >
              Gestionar Bloqueos
            </Button>
          </section>

          <div className="space-y-3">
            {slots.map((slot: any) => (
              <Card
                key={slot._id}
                className="bg-dark-100 border border-white/5 rounded-[2rem]"
              >
                <CardBody className="p-5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 ${slot.isActive ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-500"} rounded-2xl flex items-center justify-center`}
                    >
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                        ${slot.price}
                      </p>
                    </div>
                  </div>
                  <Switch
                    isSelected={slot.isActive}
                    onValueChange={(val) =>
                      updateSlot.mutate({
                        id: slot._id,
                        data: { isActive: val },
                      })
                    }
                    color="primary"
                    size="sm"
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Perfil */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar
            src="https://i.pravatar.cc/150?u=admin"
            className="w-32 h-32 rounded-[2.5rem] border-4 border-primary shadow-2xl shadow-primary/20"
          />
          <div className="absolute -bottom-2 -right-2 bg-primary text-black p-2 rounded-2xl border-4 border-dark-200">
            <Shield size={20} fill="currentColor" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            Admin Padel
          </h2>
          <p className="text-primary font-bold text-sm tracking-widest uppercase mt-1">
            Administrador Master
          </p>
        </div>
      </div>

      {/* Stats Rápidos */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-dark-100 border border-white/5 rounded-3xl">
          <CardBody className="p-4 flex flex-col items-center border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase">
              Canchas
            </p>
            <p className="text-2xl font-black text-white">{courts.length}</p>
          </CardBody>
        </Card>
        <Card className="bg-dark-100 border border-white/5 rounded-3xl">
          <CardBody className="p-4 flex flex-col items-center border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase">
              Estado
            </p>
            <Chip
              color="success"
              size="sm"
              variant="flat"
              className="font-bold border border-white/5"
            >
              Online
            </Chip>
          </CardBody>
        </Card>
      </div>

      {/* Configuración de Contacto */}
      <section className="bg-dark-100 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              WhatsApp Admin
            </p>
            <p className="text-white font-bold text-sm">Para notificaciones</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={phoneNumber}
            onValueChange={setPhoneNumber}
            placeholder="549351..."
            className="flex-grow"
            classNames={{
              inputWrapper: "bg-white/5 border-none h-12 rounded-2xl px-4",
              input: "text-white font-bold",
            }}
          />
          <Button
            isIconOnly
            className="h-12 w-12 bg-primary text-black rounded-2xl"
            onPress={handleUpdatePhone}
            isLoading={updateProfile.isPending}
          >
            <Save size={20} />
          </Button>
        </div>
        <p className="text-[10px] text-gray-500 font-bold italic">
          * Este número recibirá las alertas de nuevos turnos vía WhatsApp.
        </p>
      </section>

      {/* Secciones de Ajustes */}
      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">
            Gestión del Club
          </h3>
          <div className="space-y-3">
            <div
              onClick={() => setView("courts")}
              className="bg-dark-100 p-4 rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-sm">
                    Mis Canchas
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">
                    {courts.length} canchas activas
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-600" />
            </div>

            <div
              onClick={() => setView("schedule")}
              className="bg-dark-100 p-4 rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all font-bold"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Target size={20} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-sm">
                    Precios y Horarios
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">
                    Configurar tarifas
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-600" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">
            Preferencias
          </h3>
          <div className="bg-dark-100 p-2 rounded-[2rem] border border-white/5 space-y-1">
            <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <Bell size={18} className="text-gray-400" />
                <span className="font-bold text-white text-sm">
                  Notificaciones Push
                </span>
              </div>
              <Switch defaultSelected color="primary" size="sm" />
            </div>
            <Divider className="bg-white/5 mx-4" />
            <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <CreditCard size={18} className="text-gray-400" />
                <span className="font-bold text-white text-sm">
                  Pagos Online
                </span>
              </div>
              <Switch defaultSelected color="primary" size="sm" />
            </div>
          </div>
        </section>

        <Button
          fullWidth
          className="h-16 bg-red-500/10 text-red-500 font-black rounded-3xl uppercase tracking-widest border border-red-500/20"
          startContent={<LogOut size={20} />}
          onPress={logout}
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};
