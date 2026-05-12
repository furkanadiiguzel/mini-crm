import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../services/api";
import type { ReactNode } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState { firstName: string; lastName: string; email: string; phone: string; company: string; }
interface FormErrors extends FormState { general: string; }

const INITIAL_FORM: FormState = { firstName: "", lastName: "", email: "", phone: "", company: "" };
const INITIAL_ERRORS: FormErrors = { ...INITIAL_FORM, general: "" };

function validateForm(form: FormState): Partial<FormErrors> {
  const errors: Partial<FormErrors> = {};
  if (!form.firstName.trim()) errors.firstName = "Ad alanı zorunludur.";
  if (!form.lastName.trim())  errors.lastName  = "Soyad alanı zorunludur.";
  if (!form.email.trim())     errors.email     = "E-posta alanı zorunludur.";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Geçerli bir e-posta adresi giriniz.";
  return errors;
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function CustomerForm() {
  const navigate = useNavigate();
  const [form, setForm]       = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors]   = useState<FormErrors>(INITIAL_ERRORS);
  const [loading, setLoading] = useState(false);

  const inputClass = (field: keyof FormState) =>
    ["w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition", errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"].join(" ");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((err) => ({ ...err, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) { setErrors((prev) => ({ ...prev, ...validationErrors })); return; }

    setLoading(true);
    setErrors(INITIAL_ERRORS);
    try {
      await api.post("/customers/", {
        first_name: form.firstName.trim(), last_name: form.lastName.trim(),
        email: form.email.trim(), phone: form.phone.trim() || undefined, company: form.company.trim() || undefined,
      });
      toast.success("Müşteri başarıyla oluşturuldu.");
      navigate("/customers");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400 && err.response.data) {
        const data = err.response.data as Record<string, string | string[]>;
        const fieldMap: Record<string, keyof FormState> = { first_name: "firstName", last_name: "lastName", email: "email", phone: "phone", company: "company" };
        const mapped: Partial<FormErrors> = {};
        let hasFieldError = false;
        Object.entries(data).forEach(([key, messages]) => {
          const local = fieldMap[key];
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (local) { mapped[local] = message as string; hasFieldError = true; }
        });
        if (hasFieldError) { setErrors((prev) => ({ ...prev, ...mapped })); toast.error("Lütfen form hatalarını düzeltin."); }
        else { const general = (data.detail as string) || (data.non_field_errors as string[])?.[0] || "Bir hata oluştu."; setErrors((prev) => ({ ...prev, general })); toast.error(general); }
      } else { const msg = "Sunucu hatası, lütfen tekrar deneyin."; setErrors((prev) => ({ ...prev, general: msg })); toast.error(msg); }
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"><ArrowLeft size={16} />Müşterilere Dön</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Müşteri</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {errors.general && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.general}</div>}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Ad" error={errors.firstName} required><input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ahmet" className={inputClass("firstName")} autoFocus /></Field>
            <Field label="Soyad" error={errors.lastName} required><input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Yılmaz" className={inputClass("lastName")} /></Field>
          </div>
          <Field label="E-posta" error={errors.email} required><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ahmet@sirket.com" className={inputClass("email")} /></Field>
          <Field label="Telefon" error={errors.phone}><input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+90 532 000 00 00" className={inputClass("phone")} /></Field>
          <Field label="Şirket" error={errors.company}><input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Şirket adı" className={inputClass("company")} /></Field>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/customers" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">İptal</Link>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
              {loading && <Loader2 size={15} className="animate-spin" />}{loading ? "Kaydediliyor…" : "Müşteri Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
