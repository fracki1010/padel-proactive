import { useState, useEffect } from "react";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  addToast,
} from "@heroui/react";
import {
  useCourts,
  useSlots,
  useCreateBooking,
  useUsers,
} from "../hooks/useData";
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";

export const BookingForm = ({
  initialData,
  onCancel,
}: {
  initialData?: any;
  onCancel?: () => void;
}) => {
  const { data: courtsData } = useCourts();
  const { data: slotsData } = useSlots();
  const { data: usersData } = useUsers();
  const createMutation = useCreateBooking();

  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pagado");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const courts = courtsData?.data || [];
  const slots = slotsData?.data || [];
  const users = usersData?.data || [];

  useEffect(() => {
    if (initialData) {
      if (initialData.court?._id) setCourtId(initialData.court._id);
      if (initialData.date) setDate(initialData.date);
      if (initialData.timeSlot?.startTime)
        setTime(initialData.timeSlot.startTime);
      if (initialData.clientName) setClientName(initialData.clientName);
      if (initialData.clientPhone) setClientPhone(initialData.clientPhone);
      if (initialData.paymentStatus)
        setPaymentStatus(initialData.paymentStatus);
    }
  }, [initialData]);

  const handleUserSelect = (name: string) => {
    setClientName(name);
    const existingUser = users.find((u: any) => u.name === name);
    if (existingUser) {
      setClientPhone(existingUser.phoneNumber);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    createMutation.mutate(
      { courtId, date, time, clientName, clientPhone, paymentStatus },
      {
        onSuccess: () => {
          setSuccess("¡Reserva guardada!");
          addToast({ title: "Turno guardado correctamente", color: "success" });
          setTimeout(() => onCancel?.(), 1500);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.error || "Error al guardar";
          setError(msg);
          addToast({ title: msg, color: "danger" });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={onCancel}
          className="text-white"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Editar Turno</h1>
      </div>

      {/* Hero Card */}
      <Card className="bg-dark-200 border border-white/5 overflow-hidden rounded-[2rem]">
        <div className="relative h-40 bg-[url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <CardBody className="relative z-10 p-6 flex flex-col justify-end h-full">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
              ID RESERVA: #PDL-882
            </span>
            <h2 className="text-3xl font-black text-white">
              Reserva de Cancha
            </h2>
          </CardBody>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8 px-2">
        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="bg-primary/10 text-primary p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        {/* Client Info Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <UserIcon size={16} className="text-primary" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">
              Información del Cliente
            </h3>
          </div>

          <div className="space-y-6 bg-dark-100/30 p-6 rounded-3xl border border-white/5">
            <Autocomplete
              label="Nombre del Socio"
              placeholder="Escribe o selecciona un socio"
              labelPlacement="outside"
              inputValue={clientName}
              onInputChange={setClientName}
              onSelectionChange={(key) => handleUserSelect(key as string)}
              allowsCustomValue={true}
              classNames={{
                base: "max-w-full",
                popoverContent: "bg-dark-200 border border-white/10 text-white",
                listboxWrapper: "bg-dark-200 border border-white/10",
                listbox: "text-white",
              }}
              inputProps={{
                classNames: {
                  inputWrapper:
                    "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                  label: "text-gray-400 font-bold mb-2",
                  input: "text-white font-bold",
                },
              }}
            >
              {users.map((u: any) => (
                <AutocompleteItem
                  key={u.name}
                  textValue={u.name}
                  className="text-white hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={getInitials(u.name)}
                      className="w-6 h-6 text-[10px]"
                      style={{ backgroundColor: getAvatarColor(u.name) }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{u.name}</span>
                      <span className="text-xs text-gray-500">
                        {u.phoneNumber}
                      </span>
                    </div>
                  </div>
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <div className="flex gap-2">
              <Input
                label="Teléfono (WhatsApp)"
                placeholder="+54..."
                labelPlacement="outside"
                value={clientPhone}
                onValueChange={setClientPhone}
                className="flex-grow"
                classNames={{
                  inputWrapper:
                    "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                  label: "text-gray-400 font-bold mb-2",
                  input: "text-white font-bold",
                }}
                startContent={
                  <MessageSquare size={18} className="text-gray-500" />
                }
              />
            </div>
          </div>
        </section>

        {/* Court & Time Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Calendar size={16} className="text-primary" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">
              Cancha y Horario
            </h3>
          </div>

          <div className="space-y-6 bg-dark-100/30 p-6 rounded-3xl border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Cancha de Padel"
                placeholder="Seleccionar cancha"
                labelPlacement="outside"
                selectedKeys={courtId ? [courtId] : []}
                onSelectionChange={(keys) =>
                  setCourtId(Array.from(keys)[0] as string)
                }
                classNames={{
                  trigger: "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                  label: "text-gray-400 font-bold mb-2",
                  value: "text-white font-bold",
                  popoverContent:
                    "bg-dark-200 border border-white/10 text-white",
                  listbox: "text-white",
                }}
                startContent={<MapPin size={18} className="text-gray-500" />}
              >
                {courts.map((c) => (
                  <SelectItem key={c._id} className="text-white">
                    {c.name}
                  </SelectItem>
                ))}
              </Select>
              <Input
                type="date"
                label="Fecha"
                labelPlacement="outside"
                value={date}
                onValueChange={setDate}
                classNames={{
                  inputWrapper:
                    "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                  label: "text-gray-400 font-bold mb-2",
                  input: "text-white font-bold",
                }}
              />
            </div>

            <Select
              label="Turno (Horario)"
              placeholder="Seleccionar turno"
              labelPlacement="outside"
              selectedKeys={time ? [time] : []}
              onSelectionChange={(keys) =>
                setTime(Array.from(keys)[0] as string)
              }
              classNames={{
                trigger: "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                label: "text-gray-400 font-bold mb-2",
                value: "text-white font-bold",
                popoverContent: "bg-dark-200 border border-white/10 text-white",
                listbox: "text-white",
              }}
              startContent={<Clock size={18} className="text-gray-500" />}
            >
              {slots.map((s) => (
                <SelectItem
                  key={s.startTime}
                  textValue={s.startTime}
                  className="text-white"
                >
                  {s.startTime} - {s.endTime}
                </SelectItem>
              ))}
            </Select>
          </div>
        </section>

        {/* Payment Status */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 size={16} className="text-primary" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">
              Estado del Pago
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-dark-100/30 p-4 rounded-[2rem] border border-white/5">
            <Button
              type="button"
              className={`h-14 rounded-2xl font-bold transition-all ${
                paymentStatus === "pagado"
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "bg-dark-100/50 text-gray-500 border border-white/5"
              }`}
              onClick={() => setPaymentStatus("pagado")}
            >
              <CheckCircle2 size={18} /> Pagado
            </Button>
            <Button
              type="button"
              className={`h-14 rounded-2xl font-bold transition-all ${
                paymentStatus === "pendiente"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-dark-100/50 text-gray-500 border border-white/5"
              }`}
              onClick={() => setPaymentStatus("pendiente")}
            >
              <AlertCircle size={18} /> Pendiente
            </Button>
          </div>
        </section>

        <Button
          type="submit"
          isLoading={createMutation.isPending}
          className="w-full h-16 bg-primary text-black font-black text-lg rounded-2xl shadow-xl shadow-primary/20 mt-8"
        >
          <Save size={20} /> Guardar Reserva
        </Button>
      </form>
    </div>
  );
};
