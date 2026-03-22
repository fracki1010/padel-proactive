import {
  Spinner,
  Avatar,
  Chip,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
  addToast,
} from "@heroui/react";
import {
  MessageSquare,
  MoreVertical,
  History,
  Edit2,
  Trash2,
  Plus,
  Smartphone,
  User as UserIcon,
  Calendar,
  Info,
  Clock,
  ShieldOff,
  AlertTriangle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import {
  useUsers,
  useUserHistory,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useClearPenalties,
  useCourts,
  useSlots,
} from "../hooks/useData";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";
import type { User, Booking } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClientsProps {
  filterValue: string;
  onFilterChange: (val: string) => void;
}

export const Clients = ({ filterValue, onFilterChange }: ClientsProps) => {
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const users = usersData?.data || [];

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose,
  } = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const deleteUser = useDeleteUser();
  const clearPenalties = useClearPenalties();

  const { data: historyData, isLoading: isLoadingHistory } = useUserHistory(
    selectedUser?._id || null,
  );
  const history: Booking[] = historyData?.data || [];

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u: User) =>
        u.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        u.phoneNumber.includes(filterValue),
    );
  }, [users, filterValue]);

  const { visibleCount, sentinelRef, hasMore } = useInfiniteScroll(
    12,
    9,
    filteredUsers.length,
  );

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  const handleCreate = () => {
    setFormMode("create");
    setSelectedUser(null);
    onModalOpen();
  };

  const handleEdit = (user: User) => {
    setFormMode("edit");
    setSelectedUser(user);
    onModalOpen();
  };

  const handleHistory = (user: User) => {
    setSelectedUser(user);
    onHistoryOpen();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este socio?")) {
      try {
        await deleteUser.mutateAsync(id);
        addToast({ title: "Socio eliminado", color: "success" });
      } catch (err) {
        addToast({ title: "Error al eliminar socio", color: "danger" });
      }
    }
  };

  const handleClearPenalties = async (id: string) => {
    if (
      confirm("¿Deseas limpiar las penalizaciones y rehabilitar a este socio?")
    ) {
      try {
        await clearPenalties.mutateAsync(id);
        addToast({ title: "Penalizaciones eliminadas", color: "success" });
      } catch (err) {
        addToast({ title: "Error al limpiar penalizaciones", color: "danger" });
      }
    }
  };

  //agregar el + y los espacios al numero de telefono +54 9 2622516446
  function formatPhoneNumber(phoneNumber: string) {
    return (
      "+" +
      phoneNumber
        .replace(" ", "")
        .replace("549", "54 9 ")
        .replace("2622", "2622 ")
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Gestión de Socios</h1>
          <p className="text-gray-500">
            Administra tus clientes, historial y turnos fijos
          </p>
        </div>
        <Button
          color="primary"
          className="rounded-2xl font-bold px-6 shadow-lg shadow-primary/20"
          startContent={<Plus size={20} />}
          onClick={handleCreate}
        >
          Nuevo Socio
        </Button>
      </div>

      <div className="bg-dark-200 p-2 rounded-3xl border border-white/5 shadow-2xl">
        <Input
          isClearable
          className="w-full"
          placeholder="Buscar por nombre o teléfono..."
          startContent={<UserIcon className="text-gray-400" size={18} />}
          value={filterValue}
          onValueChange={onFilterChange}
          variant="flat"
          classNames={{
            inputWrapper: "bg-transparent border-none",
            input: "text-white",
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingUsers ? (
          <div className="col-span-full flex justify-center p-12">
            <Spinner color="primary" size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full bg-dark-200/50 rounded-3xl p-12 text-center border border-dashed border-white/10">
            <UserIcon size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">
              No se encontraron socios que coincidan con la búsqueda.
            </p>
          </div>
        ) : (
          <>
            {visibleUsers.map((client: User) => (
              <Card
                key={client._id}
                className="bg-dark-200 border-white/5 hover:border-primary/30 transition-all duration-300 rounded-3xl group"
                shadow="sm"
              >
                <CardBody className="p-5 flex flex-row items-center gap-4">
                  <Avatar
                    name={getInitials(client.name)}
                    className="w-16 h-16 rounded-2xl text-white font-black text-xl shrink-0"
                    style={{ backgroundColor: getAvatarColor(client.name) }}
                  />

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-white truncate">
                        {client.name}
                      </h4>
                      {client.fixedTurns && client.fixedTurns.length > 0 && (
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          className="h-5 px-1 bg-success/10 text-[10px] font-black uppercase"
                        >
                          Fijo
                        </Chip>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                      <Smartphone size={14} />
                      <span>{formatPhoneNumber(client.phoneNumber)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <Chip
                        size="sm"
                        className="bg-primary/10 text-primary font-black text-[10px] uppercase h-5"
                      >
                        {client.level || "INTERMEDIO"}
                      </Chip>
                      {(client.penalties || 0) > 0 && !client.isSuspended && (
                        <Chip
                          size="sm"
                          color="warning"
                          variant="flat"
                          className="h-5 px-1 text-[10px] font-black uppercase"
                          startContent={
                            <AlertTriangle size={9} className="ml-1" />
                          }
                        >
                          {client.penalties}/2
                        </Chip>
                      )}
                      {client.isSuspended && (
                        <Chip
                          size="sm"
                          color="danger"
                          variant="flat"
                          className="h-5 px-1 text-[10px] font-black uppercase"
                          startContent={<ShieldOff size={9} className="ml-1" />}
                        >
                          SUSPENDIDO
                        </Chip>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Dropdown
                      placement="bottom-end"
                      className="bg-dark-300 border border-white/10"
                    >
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          variant="light"
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreVertical size={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Acciones de socio"
                        color="primary"
                      >
                        <DropdownItem
                          key="history"
                          startContent={<History size={16} />}
                          onClick={() => handleHistory(client)}
                        >
                          Ver Historial
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit2 size={16} />}
                          onClick={() => handleEdit(client)}
                        >
                          Editar Perfil
                        </DropdownItem>
                        <DropdownItem
                          key="whatsapp"
                          startContent={<MessageSquare size={16} />}
                          onClick={() =>
                            window.open(
                              `https://wa.me/${client.phoneNumber.replace(/\D/g, "")}`,
                              "_blank",
                            )
                          }
                        >
                          Enviar WhatsApp
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash2 size={16} />}
                          onClick={() => handleDelete(client._id)}
                        >
                          Eliminar Socio
                        </DropdownItem>
                        {client.isSuspended || (client.penalties || 0) > 0 ? (
                          <DropdownItem
                            key="clear-penalties"
                            color="success"
                            className="text-success"
                            startContent={<ShieldOff size={16} />}
                            onClick={() => handleClearPenalties(client._id)}
                          >
                            Despenalizar Socio
                          </DropdownItem>
                        ) : (
                          <DropdownItem key="no-penalty" className="hidden" />
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </CardBody>
              </Card>
            ))}

            {/* Sentinel + loader para infinite scroll */}
            <div ref={sentinelRef} className="col-span-full">
              {hasMore && (
                <div className="flex justify-center py-6">
                  <Spinner color="primary" size="sm" />
                </div>
              )}
              {!hasMore && filteredUsers.length > 12 && (
                <p className="text-center text-gray-600 text-xs font-bold uppercase tracking-widest py-4">
                  {filteredUsers.length} socios cargados
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de Formulario (Crear/Editar) */}
      <UserModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        user={selectedUser}
        mode={formMode}
      />

      {/* Drawer/Modal de Historial */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={onHistoryClose}
        user={selectedUser}
        history={history}
        isLoading={isLoadingHistory}
      />
    </div>
  );
};

// --- Subcomponentes ---

const UserModal = ({
  isOpen,
  onClose,
  user,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  mode: "create" | "edit";
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<
    "principiante" | "intermedio" | "avanzado" | "pro"
  >("intermedio");
  const [fixedTurns, setFixedTurns] = useState<any[]>([]);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: courtsData } = useCourts();
  const { data: slotsData } = useSlots();

  const courts = courtsData?.data || [];
  const slots = slotsData?.data || [];

  useMemo(() => {
    if (user && mode === "edit") {
      setName(user.name);
      setPhone(user.phoneNumber);
      setLevel(user.level || "intermedio");
      setFixedTurns(user.fixedTurns || []);
    } else {
      setName("");
      setPhone("");
      setLevel("intermedio");
      setFixedTurns([]);
    }
  }, [user, mode, isOpen]);

  const handleAddFixedTurn = () => {
    setFixedTurns([...fixedTurns, { dayOfWeek: 1, court: "", timeSlot: "" }]);
  };

  const handleRemoveFixedTurn = (index: number) => {
    setFixedTurns(fixedTurns.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const data = {
        name,
        phoneNumber: phone,
        level,
        fixedTurns: fixedTurns.filter((ft) => ft.court && ft.timeSlot),
      };

      if (mode === "create") {
        await createUser.mutateAsync(data);
        addToast({ title: "Socio creado correctamente", color: "success" });
      } else if (user) {
        await updateUser.mutateAsync({ id: user._id, data });
        addToast({ title: "Socio guardado correctamente", color: "success" });
      }
      onClose();
    } catch (err) {
      addToast({ title: "Error al guardar socio", color: "danger" });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      className="bg-dark-300 text-white dark"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-white/5 pb-4">
          <h2 className="text-xl font-black">
            {mode === "create" ? "Nuevo Socio" : "Editar Socio"}
          </h2>
          <p className="text-sm text-gray-500 font-normal">
            Completa la información del perfil del socio.
          </p>
        </ModalHeader>
        <ModalBody className="py-6 space-y-6 dark">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              placeholder="Ej: Juan Perez"
              value={name}
              onValueChange={setName}
              variant="bordered"
              className="dark"
            />
            <Input
              label="Teléfono"
              placeholder="Ej: 549..."
              value={phone}
              onValueChange={setPhone}
              variant="bordered"
            />
          </div>

          <Select
            label="Nivel de Juego"
            variant="bordered"
            className="dark"
            classNames={{
              trigger: "bg-dark-100/50 border-white/10 h-14 rounded-xl",
              label: "text-gray-400 font-bold mb-2",
              value: "text-white font-bold",
              popoverContent: "bg-dark-200 border border-white/10 text-white",
              listbox: "text-white",
            }}
            selectedKeys={[level]}
            onSelectionChange={(keys) => setLevel(Array.from(keys)[0] as any)}
          >
            <SelectItem key="principiante">Principiante</SelectItem>
            <SelectItem key="intermedio">Intermedio</SelectItem>
            <SelectItem key="avanzado">Avanzado</SelectItem>
            <SelectItem key="pro">Profesional / Pro</SelectItem>
          </Select>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Turnos Fijos
              </h3>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className="rounded-xl font-bold"
                onClick={handleAddFixedTurn}
              >
                Agregar
              </Button>
            </div>

            {fixedTurns.length === 0 ? (
              <p className="text-sm text-gray-500 bg-dark-200 p-4 rounded-2xl border border-dashed border-white/5 text-center">
                No tiene turnos fijos asignados.
              </p>
            ) : (
              <div className="space-y-3">
                {fixedTurns.map((ft, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end bg-dark-200 p-3 rounded-2xl border border-white/5 relative group"
                  >
                    <div className="col-span-4">
                      <Select
                        label="Día"
                        size="sm"
                        variant="flat"
                        className="dark"
                        classNames={{
                          trigger:
                            "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                          label: "text-gray-400 font-bold mb-2",
                          value: "text-white font-bold",
                          popoverContent:
                            "bg-dark-200 border border-white/10 text-white",
                          listbox: "text-white",
                        }}
                        selectedKeys={[ft.dayOfWeek.toString()]}
                        onSelectionChange={(keys) => {
                          const newTurns = [...fixedTurns];
                          newTurns[index].dayOfWeek = parseInt(
                            Array.from(keys)[0] as string,
                          );
                          setFixedTurns(newTurns);
                        }}
                      >
                        <SelectItem key="1">Lunes</SelectItem>
                        <SelectItem key="2">Martes</SelectItem>
                        <SelectItem key="3">Miércoles</SelectItem>
                        <SelectItem key="4">Jueves</SelectItem>
                        <SelectItem key="5">Viernes</SelectItem>
                        <SelectItem key="6">Sábado</SelectItem>
                        <SelectItem key="0">Domingo</SelectItem>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Select
                        label="Cancha"
                        size="sm"
                        variant="flat"
                        className="dark"
                        classNames={{
                          trigger:
                            "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                          label: "text-gray-400 font-bold mb-2",
                          value: "text-white font-bold",
                          popoverContent:
                            "bg-dark-200 border border-white/10 text-white",
                          listbox: "text-white",
                        }}
                        selectedKeys={[ft.court?._id || ft.court || ""]}
                        onSelectionChange={(keys) => {
                          const newTurns = [...fixedTurns];
                          newTurns[index].court = Array.from(keys)[0] as string;
                          setFixedTurns(newTurns);
                        }}
                      >
                        {courts.map((c: any) => (
                          <SelectItem key={c._id}>{c.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Select
                        label="Hora"
                        size="sm"
                        variant="flat"
                        className="dark"
                        classNames={{
                          trigger:
                            "bg-dark-100/50 border-white/10 h-14 rounded-xl",
                          label: "text-gray-400 font-bold mb-2",
                          value: "text-white font-bold",
                          popoverContent:
                            "bg-dark-200 border border-white/10 text-white",
                          listbox: "text-white",
                        }}
                        selectedKeys={[ft.timeSlot?._id || ft.timeSlot || ""]}
                        onSelectionChange={(keys) => {
                          const newTurns = [...fixedTurns];
                          newTurns[index].timeSlot = Array.from(
                            keys,
                          )[0] as string;
                          setFixedTurns(newTurns);
                        }}
                      >
                        {slots.map((s: any) => (
                          <SelectItem key={s._id}>{s.startTime}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-1 pb-1 text-center">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={() => handleRemoveFixedTurn(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-white/5 pt-4">
          <Button
            variant="light"
            onPress={onClose}
            className="rounded-2xl font-bold"
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            className="rounded-2xl font-black px-8"
            isLoading={createUser.isPending || updateUser.isPending}
          >
            {mode === "create" ? "Crear" : "Guardar Cambios"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const HistoryModal = ({
  isOpen,
  onClose,
  user,
  history,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  history: Booking[];
  isLoading: boolean;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      className="bg-dark-300 text-white"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={getInitials(user?.name || "")}
              className="w-12 h-12 rounded-2xl"
              style={{ backgroundColor: getAvatarColor(user?.name || "") }}
            />
            <div>
              <h2 className="text-xl font-black">Historial de {user?.name}</h2>
              <p className="text-xs text-gray-500 font-normal">
                Registro completo de turnos y pagos
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="py-6 px-4">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Spinner color="primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-dark-200 rounded-3xl border border-white/5">
              <Info size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500">
                Este socio aún no tiene actividad registrada.
              </p>
            </div>
          ) : (
            <ScrollShadow className="max-h-[500px] pr-2">
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="bg-dark-200/50 p-4 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      {/* Izquierda: Fecha y Hora */}
                      <div className="flex items-start gap-4">
                        <div className="bg-white/5 p-2 rounded-2xl flex flex-col items-center min-w-[55px] font-black">
                          <span className="text-[10px] text-primary uppercase">
                            {format(new Date(item.date), "EEE", { locale: es })}
                          </span>
                          <span className="text-lg">
                            {format(new Date(item.date), "dd")}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                            {format(new Date(item.date), "MMMM yyyy", {
                              locale: es,
                            })}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 font-bold text-white">
                              <Clock size={14} className="text-primary" />
                              {item.timeSlot?.startTime}
                            </div>
                            <div className="h-3 w-[1px] bg-white/10 hidden sm:block"></div>
                            <p className="text-sm font-medium text-gray-300">
                              {item.court?.name || "Mantenimiento"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Derecha: Estado y Precio */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                        <Chip
                          size="sm"
                          variant="flat"
                          className="font-black text-[10px] h-6 px-3"
                          color={
                            item.status === "cancelado"
                              ? "danger"
                              : item.status === "confirmado"
                                ? "success"
                                : item.status === "suspendido"
                                  ? "warning"
                                  : "default"
                          }
                        >
                          {item.status.toUpperCase()}
                        </Chip>
                        <p className="text-xl font-black text-white">
                          <span className="text-xs text-primary mr-1">$</span>
                          {item.finalPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollShadow>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
