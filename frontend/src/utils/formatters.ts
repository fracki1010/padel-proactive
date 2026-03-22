export const formatDate = (dateString: string) => {
  const rawDate = new Date(dateString);
  const utcDate = new Date(
    rawDate.getTime() + rawDate.getTimezoneOffset() * 60000,
  );
  return utcDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
};
