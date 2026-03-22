import {
  Navbar as HeroNavbar,
  NavbarContent,
  Button,
  Avatar,
  Badge,
} from "@heroui/react";
import { Bell } from "lucide-react";

interface NavbarProps {
  title?: string;
  onAvatarClick?: () => void;
  onBellClick?: () => void;
  notificationCount?: number;
}

export const Navbar = ({
  title = "Turnos de Hoy",
  onAvatarClick,
  onBellClick,
  notificationCount = 0,
}: NavbarProps) => {
  return (
    <HeroNavbar
      maxWidth="full"
      className="bg-background border-none h-20"
      classNames={{
        wrapper: "px-6 gap-0",
      }}
    >
      <NavbarContent justify="start" className="gap-4">
        <p className="text-xl font-bold text-white tracking-tight">{title}</p>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4">
        <Badge
          color="danger"
          content={notificationCount}
          isInvisible={notificationCount === 0}
          shape="circle"
          size="md"
          placement="top-right"
        >
          <Button
            isIconOnly
            variant="flat"
            className="bg-dark-100/50 text-primary border border-primary/20"
            radius="lg"
            onPress={onBellClick}
          >
            <Bell size={20} />
          </Button>
        </Badge>
        <Avatar
          src="https://i.pravatar.cc/150?u=admin"
          className="w-10 h-10 border-2 border-primary/20 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          radius="lg"
          onClick={onAvatarClick}
        />
      </NavbarContent>
    </HeroNavbar>
  );
};
