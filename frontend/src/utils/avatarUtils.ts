export const getInitials = (name: string = "") => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
};

export const getAvatarColor = (name: string = "") => {
  const colors = [
    "#E74C3C", // Alizarin
    "#3498DB", // Peter River
    "#2ECC71", // Emerald
    "#F1C40F", // Sun Flower
    "#9B59B6", // Amethyst
    "#1ABC9C", // Turquoise
    "#E67E22", // Carrot
    "#34495E", // Wet Asphalt
    "#FF4081", // Pink
    "#00BCD4", // Cyan
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
