import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Eye, EyeOff, Layers, Play } from "lucide-react";

export function LoginPage() {
  const { login, loginWithGoogle, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Introduce tu email"); return; }
    if (password.length < 4) { setError("Minimo 4 caracteres"); return; }
    const ok = login(email, password);
    if (ok) navigate("/dashboard");
    else setError("Credenciales incorrectas");
  };

  const handleGoogle = () => {
    loginWithGoogle();
    navigate("/dashboard");
  };

  const handleDemo = () => {
    loginDemo();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#9CFF49] flex items-center justify-center mb-4">
            <Layers className="w-7 h-7 text-[#0a0a0a]" />
          </div>
          <h1 className="tracking-[0.25em] text-foreground">SILE</h1>
          <p className="text-muted-foreground mt-1 text-center" style={{ fontSize: "0.8rem" }}>
            Tu coleccion, valorada y conectada
          </p>
        </div>

        {/* Google button */}
        <Button
          variant="outline"
          className="w-full h-11 gap-3 mb-3 border-border"
          onClick={handleGoogle}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </Button>

        <div className="flex items-center gap-3 my-4">
          <Separator className="flex-1" />
          <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>o</span>
          <Separator className="flex-1" />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" style={{ fontSize: "0.8rem" }}>Email</Label>
            <Input
              id="email" type="email" placeholder="tu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-10 bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" style={{ fontSize: "0.8rem" }}>
              {isRegister ? "Crear contrasena" : "Contrasena"}
            </Label>
            <div className="relative">
              <Input
                id="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-secondary/50 border-border pr-10"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-destructive" style={{ fontSize: "0.8rem" }}>{error}</p>}

          <Button type="submit" className="w-full h-10 bg-[#9CFF49] text-[#0a0a0a] hover:bg-[#8ae63e]">
            {isRegister ? "Crear cuenta" : "Iniciar sesion"}
          </Button>
        </form>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-center mt-3 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontSize: "0.8rem" }}
        >
          {isRegister ? "Ya tengo cuenta — Iniciar sesion" : "No tengo cuenta — Registrarme"}
        </button>

        {/* Demo mode */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleDemo}
          >
            <Play className="w-4 h-4" />
            <span style={{ fontSize: "0.8rem" }}>Probar en modo demo</span>
          </Button>
          <p className="text-center text-muted-foreground mt-1" style={{ fontSize: "0.7rem" }}>
            Explora SILE con datos de ejemplo, sin crear cuenta
          </p>
        </div>
      </div>
    </div>
  );
}