import { Card, CardBody, Chip, Button } from "@heroui/react";
import type { Booking } from "../types";
import { MoreVertical } from "lucide-react";

interface BookingCardProps {
  booking: Booking;
  onClick?: (booking: Booking) => void;
}

const statusColorMap: Record<string, string> = {
  confirmado: "bg-primary text-black",
  reservado: "bg-orange-500 text-white",
  cancelado: "bg-red-500 text-white",
};

const statusLabelMap: Record<string, string> = {
  confirmado: "PAGO",
  reservado: "PENDIENTE",
  cancelado: "CANCELADO",
};

export const BookingCard = ({ booking, onClick }: BookingCardProps) => {
  const isAvailable = booking.status === "disponible";

  if (isAvailable) {
    return (
      <Card
        isPressable
        onPress={() => onClick?.(booking)}
        className="bg-primary border-none shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
      >
        <CardBody className="p-4 flex flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-black leading-none">
              {booking.timeSlot?.startTime || "00:00"}
            </span>
            <span className="text-[10px] font-bold text-black/60 uppercase">
              90 MIN
            </span>
          </div>

          <div className="w-[1px] h-10 bg-black/10"></div>

          <div className="flex-grow flex flex-col">
            <span className="font-bold text-black text-lg">DISPONIBLE</span>
            <span className="text-xs text-black/70 font-medium italic">
              ¡Presiona para reservar!
            </span>
          </div>

          <Button
            isIconOnly
            variant="flat"
            className="bg-black/10 text-black min-w-10 w-10 h-10"
            radius="full"
          >
            <MoreVertical size={20} />
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      isPressable
      onPress={() => onClick?.(booking)}
      className="bg-dark-200 border border-white/5 hover:border-primary/30 transition-all shadow-xl"
    >
      <CardBody className="p-4 flex flex-row items-center gap-6">
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-xl font-bold text-white leading-none">
            {booking.timeSlot?.startTime}
          </span>
          <span className="text-[10px] font-bold text-white/40 uppercase">
            90 MIN
          </span>
        </div>

        <div className="flex flex-col flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-white text-lg truncate">
              {booking.clientName}
            </span>
            <Chip
              size="sm"
              className={`${statusColorMap[booking.status] || "bg-gray-600"} h-5 px-1.5 text-[10px] font-black tracking-tighter`}
              radius="sm"
            >
              {statusLabelMap[booking.status] || booking.status.toUpperCase()}
            </Chip>
            {booking.isFixed && (
              <Chip
                size="sm"
                className="bg-success/20 text-success border border-success/30 h-5 px-1.5 text-[10px] font-black"
                radius="sm"
              >
                FIJO
              </Chip>
            )}
          </div>
          <span className="text-sm text-white/50 font-medium truncate">
            {booking.court?.name} • Nivel: Intermedio (4.0)
          </span>
        </div>

        <Button
          isIconOnly
          variant="flat"
          className="bg-primary/10 text-primary min-w-10 w-10 h-10"
          radius="full"
        >
          <MoreVertical size={20} />
        </Button>
      </CardBody>
    </Card>
  );
};
