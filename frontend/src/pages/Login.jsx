import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Eye, EyeOff, AlertCircle, Loader2,
  Users, TrendingUp, BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ── Decorative feature items (left panel) ────────────────────────────────────

const FEATURES = [
  { icon: Users,      text: "Müşteri yönetimi ve takibi"           },
  { icon: TrendingUp, text: "Satış fırsatlarını izleyin"           },
  { icon: BarChart3,  text: "Gerçek zamanlı iş analizleri"         },
];

// ── Geometric shapes (pure CSS, no images) ───────────────────────────────────

function Shape({ className }) {
  return <div className={`absolute rounded-full opacity-10 ${className}`} />;
}

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:flex-col relative w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-900 overflow-hidden">
      {/* Geometric decoration */}
      <Shape className="w-96 h-96 bg-white -top-24 -left-24" />
      <Shape className="w-64 h-64 bg-indigo-400 top-1/3 -right-16" />
      <Shape className="w-48 h-48 bg-white bottom-16 left-12" />
      <Shape className="w-32 h-32 bg-indigo-300 bottom-40 right-24" />

      {/* Grid dots overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full px-12 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">Mini CRM</span>
        </div>

        {/* Hero text */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Müşteri ilişkilerinizi
              <br />
              <span className="text-indigo-200">güçlendirin.</span>
            </h2>
            <p className="mt-4 text-indigo-200 text-base leading-relaxed max-w-xs">
              Satışlarınızı büyütün, müşterilerinizi tanıyın ve fırsatlarınızı
              kaçırmayın.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white/15 rounded-lg shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <span className="text-sm text-indigo-100 font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <p className="text-xs text-indigo-300">
          © {new Date().getFullYear()} Mini CRM. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(form.username.trim(), form.password);
      navigate("/");
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Kullanıcı adı veya şifre hatalı.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-3.5 py-2.5 border rounded-lg text-sm text-neutral-900 " +
    "placeholder-neutral-400 transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <LeftPanel />

      {/* Right form panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top banner */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 py-5 bg-indigo-600">
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-white">Mini CRM</span>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-neutral-50">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-neutral-900">Hoş Geldiniz</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Hesabınıza giriş yapın
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Kullanıcı Adı
                </label>
                <input
                  name="username"
                  autoComplete="username"
                  autoFocus
                  placeholder="admin"
                  value={form.username}
                  onChange={handleChange}
                  className={`${inputBase} ${error ? "border-red-400 bg-red-50" : "border-neutral-300 bg-white"}`}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputBase} pr-11 ${error ? "border-red-400 bg-red-50" : "border-neutral-300 bg-white"}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Giriş yapılıyor…
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
