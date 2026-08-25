import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, HeartHandshake, ShieldAlert } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden select-none">
      <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-sm mx-auto space-y-6">
        <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-xl mx-auto animate-pulse">
          <Droplets size={40} className="text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">LifeStream</h1>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">
            Emergency Blood Network
          </p>
        </div>

        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          Connecting critical patients with verified local blood donors in real-time.
        </p>

        <div className="pt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
