import { useState, useEffect } from 'react';
import { Shield, Loader2, Eye, EyeOff, Zap } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('maria.garcia@bioasist.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    onLogin();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        src="/nurse_medical_instruments.mp4"
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-bio-primary/95 via-bio-primary/80 to-black/70" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-64 h-64 bg-white/[0.02] rounded-full"
            style={{
              left: `${10 + i * 18}%`,
              top: `${15 + (i % 3) * 30}%`,
              animation: `float ${6 + i * 1.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div
        className={`relative max-w-md w-full mx-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl transition-all duration-700 delay-200 ${mounted ? 'scale-100 rotate-0' : 'scale-50 -rotate-12'}`}>
            <img src="/images (1).png" alt="Bio Asist" className="w-12 h-12 rounded-lg object-contain" />
          </div>
          <h1 className={`text-3xl font-black text-white mt-5 tracking-tight transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Bio Asist
          </h1>
          <p className={`text-white/50 text-sm font-medium mt-1 transition-all duration-700 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            Ecosistema Digital de Gestión
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/15 shadow-2xl transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:border-bio-secondary focus:ring-2 focus:ring-bio-secondary/20 outline-none transition-all text-sm font-medium"
                placeholder="usuario@bioasist.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:border-bio-secondary focus:ring-2 focus:ring-bio-secondary/20 outline-none transition-all text-sm font-medium pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/30 bg-white/10 text-bio-secondary focus:ring-bio-secondary/20" />
                <span className="text-xs text-white/50 font-medium">Recordarme</span>
              </label>
              <button type="button" className="text-xs text-bio-secondary/80 hover:text-bio-secondary font-bold transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-7 py-4 bg-gradient-to-r from-bio-secondary to-emerald-400 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-bio-secondary/30 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Demo mode hint */}
        <div className={`mt-6 text-center transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Zap className="w-3.5 h-3.5 text-bio-secondary" />
            <span className="text-[11px] text-white/40 font-bold">Demo Mode — Credenciales precargadas</span>
          </div>
        </div>

        {/* Footer */}
        <p className={`text-center text-[10px] text-white/20 mt-6 font-medium transition-all duration-700 delay-800 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          © {new Date().getFullYear()} Grow Labs — Todos los derechos reservados
        </p>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
