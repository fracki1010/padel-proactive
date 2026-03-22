// frontend/src/pages/Login.tsx
import { useState } from "react";
import { Card, CardBody, Input, Button } from "@heroui/react";
import { Lock, User, Eye, EyeOff, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      if (response.data.success) {
        login(response.data.data.token, response.data.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(163,255,51,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(163,255,51,0.05),transparent)]">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-[2rem] flex items-center justify-center border border-primary/20 mb-6 group">
            <Activity
              className="text-primary group-hover:scale-110 transition-transform duration-500"
              size={32}
            />
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            Padel <span className="text-primary italic">Pro</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            Portal de Administración
          </p>
        </div>

        <Card className="bg-dark-100/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl p-4">
          <CardBody className="p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Usuario"
                  placeholder="admin_padel"
                  labelPlacement="outside"
                  variant="flat"
                  size="lg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  classNames={{
                    inputWrapper:
                      "bg-white/5 border-white/5 group-data-[focus=true]:border-primary/50 transition-all h-14 rounded-2xl",
                    label:
                      "text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1",
                    input: "text-white font-bold",
                  }}
                  startContent={<User className="text-gray-500" size={18} />}
                />

                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  labelPlacement="outside"
                  variant="flat"
                  size="lg"
                  type={isVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  classNames={{
                    inputWrapper:
                      "bg-white/5 border-white/5 group-data-[focus=true]:border-primary/50 transition-all h-14 rounded-2xl",
                    label:
                      "text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-1",
                    input: "text-white font-bold",
                  }}
                  startContent={<Lock className="text-gray-500" size={18} />}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <EyeOff className="text-gray-500" size={18} />
                      ) : (
                        <Eye className="text-gray-500" size={18} />
                      )}
                    </button>
                  }
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="h-16 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Ingresar al Sistema
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 Padel Pro Control • v1.0.0
        </p>
      </div>
    </div>
  );
};
