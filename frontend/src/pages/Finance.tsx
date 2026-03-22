import { Card, CardBody, Button, ScrollShadow } from "@heroui/react";
import { formatCurrency, formatDate } from "../utils/formatters";
import { useState, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface FinanceProps {
  bookings: any[];
}

export const Finance = ({ bookings }: FinanceProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const metrics = useMemo(() => {
    const filteredMonth = bookings.filter((b) => {
      const d = new Date(b.date);
      return (
        d.getUTCMonth() === selectedMonth && d.getUTCFullYear() === selectedYear
      );
    });

    const confirmedMonth = filteredMonth.filter(
      (b) => b.status === "confirmado" || b.status === "reservado",
    );
    const totalMonth = confirmedMonth.reduce(
      (acc, b) => acc + (Number(b.finalPrice) || 0),
      0,
    );

    const paidMonth = confirmedMonth.filter(
      (b) => b.paymentStatus === "pagado",
    );
    const totalPaidMonth = paidMonth.reduce(
      (acc, b) => acc + (Number(b.finalPrice) || 0),
      0,
    );

    const dailyBookings = bookings.filter((b) => {
      const d = b.date.split("T")[0];
      return d === todayStr;
    });
    const confirmedDaily = dailyBookings.filter(
      (b) => b.status === "confirmado" || b.status === "reservado",
    );
    const totalDaily = confirmedDaily.reduce(
      (acc, b) => acc + (Number(b.finalPrice) || 0),
      0,
    );

    const paidDaily = confirmedDaily.filter(
      (b) => b.paymentStatus === "pagado",
    );
    const totalPaidDaily = paidDaily.reduce(
      (acc, b) => acc + (Number(b.finalPrice) || 0),
      0,
    );

    return {
      totalMonth,
      totalPaidMonth,
      totalDaily,
      totalPaidDaily,
      countMonth: filteredMonth.length,
      countConfirmedMonth: confirmedMonth.length,
      countPaidMonth: paidMonth.length,
      countPendingMonth: confirmedMonth.length - paidMonth.length,
      totalPendingMonth: totalMonth - totalPaidMonth,
      countDaily: dailyBookings.length,
      countConfirmedDaily: confirmedDaily.length,
      countPaidDaily: paidDaily.length,
      avgPrice:
        confirmedMonth.length > 0 ? totalMonth / confirmedMonth.length : 0,
      movements: filteredMonth
        .slice()
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    };
  }, [bookings, selectedMonth, selectedYear, todayStr]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((v) => v - 1);
    } else {
      setSelectedMonth((v) => v - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((v) => v + 1);
    } else {
      setSelectedMonth((v) => v + 1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Selector de Mes */}
      <div className="flex items-center justify-between bg-dark-200 p-2 rounded-2xl border border-white/5">
        <Button
          isIconOnly
          variant="light"
          onClick={handlePrevMonth}
          className="text-gray-400"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">
            {months[selectedMonth]} {selectedYear}
          </h2>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Periodo de Facturación
          </p>
        </div>
        <Button
          isIconOnly
          variant="light"
          onClick={handleNextMonth}
          className="text-gray-400"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recaudación Mensual */}
        <Card className="bg-primary shadow-[0_0_30px_rgba(163,255,51,0.15)] border-none overflow-hidden relative group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-black/10 rounded-full blur-3xl group-hover:bg-black/20 transition-all duration-700"></div>
          <CardBody className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-black/10 rounded-2xl">
                <TrendingUp size={24} className="text-black" />
              </div>
              <span className="text-[10px] font-black text-black/40 uppercase tracking-widest bg-black/5 px-3 py-1 rounded-full">
                Este Mes
              </span>
            </div>
            <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.2em] mb-1">
              Efectivo en Caja (Mes)
            </p>
            <h3 className="text-5xl font-black text-black tracking-tighter">
              {formatCurrency(metrics.totalPaidMonth)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-black text-black/50 uppercase tracking-tight">
                {metrics.countPaidMonth} Cobros realizados
              </span>
              <div className="w-1 h-1 bg-black/20 rounded-full"></div>
              <span className="text-[12px] font-black text-black/30 uppercase tracking-tight">
                {formatCurrency(metrics.totalMonth - metrics.totalPaidMonth)}{" "}
                Pendiente de cobro
              </span>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-black/40 uppercase">
                  Confirmados
                </span>
                <span className="text-xl font-black text-black">
                  {metrics.countConfirmedMonth}
                </span>
              </div>
              <div className="w-px h-8 bg-black/10 my-auto"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-black/40 uppercase">
                  Promedio
                </span>
                <span className="text-xl font-black text-black">
                  {formatCurrency(metrics.avgPrice)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recaudación Diaria */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-dark-200 border border-white/5 rounded-[2rem]">
            <CardBody className="p-6">
              <div className="flex flex-col gap-1">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-2">
                  <Calendar size={18} className="text-blue-500" />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Cobrado Hoy
                </p>
                <h4 className="text-2xl font-black text-white">
                  {formatCurrency(metrics.totalPaidDaily)}
                </h4>
                <p className="text-[10px] font-bold text-gray-600 uppercase mt-1">
                  TOTAL: {formatCurrency(metrics.totalDaily)}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-dark-200 border border-white/5 rounded-[2rem]">
            <CardBody className="p-6">
              <div className="flex flex-col gap-1">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-2">
                  <Clock size={18} className="text-orange-500" />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Pendientes
                </p>
                <h4 className="text-2xl font-black text-white">
                  {metrics.countPendingMonth}
                </h4>
                <p className="text-[10px] font-bold text-gray-600 uppercase mt-1">
                  {formatCurrency(metrics.totalPendingMonth)} POR COBRAR
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Últimos Movimientos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
            Movimientos del Mes
          </h3>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
            {metrics.movements.length} OPERACIONES
          </span>
        </div>

        <ScrollShadow className="max-h-[400px] space-y-3">
          {metrics.movements.length > 0 ? (
            metrics.movements.map((b) => (
              <div
                key={b._id}
                className="bg-dark-200 p-4 rounded-3xl border border-white/5 flex justify-between items-center hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      b.status === "confirmado"
                        ? "bg-primary/10 text-primary"
                        : "bg-orange-500/10 text-orange-500"
                    }`}
                  >
                    {b.status === "confirmado" ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white group-hover:text-primary transition-colors">
                      {b.clientName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      {formatDate(b.date)} • {b.court?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-black text-lg ${b.status === "confirmado" ? "text-white" : "text-gray-500 line-through"}`}
                  >
                    {formatCurrency(b.finalPrice)}
                  </p>
                  <p
                    className={`text-[8px] font-bold uppercase ${b.paymentStatus === "pagado" ? "text-primary" : "text-orange-500"}`}
                  >
                    {b.paymentStatus === "pagado" ? "COBRADO" : "PENDIENTE"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 font-bold italic">
                No hay movimientos en este periodo.
              </p>
            </div>
          )}
        </ScrollShadow>
      </div>
    </div>
  );
};
