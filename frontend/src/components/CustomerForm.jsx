import { useState } from "react";
import toast from "react-hot-toast";
import { customerService } from "../services/api";

const STATUS_OPTIONS = ["lead", "prospect", "customer", "inactive"];

export default function CustomerForm({ initial = {}, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    first_name: initial.first_name ?? "",
    last_name: initial.last_name ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    company: initial.company ?? "",
    status: initial.status ?? "lead",
    notes: initial.notes ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial.id) {
        await customerService.update(initial.id, form);
        toast.success("Customer updated");
      } else {
        await customerService.create(form);
        toast.success("Customer created");
      }
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.email?.[0] ?? "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input className="input" name="first_name" value={form.first_name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input className="input" name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input className="input" name="company" value={form.company} onChange={handleChange} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select className="input" name="status" value={form.status} onChange={handleChange}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea className="input" name="notes" value={form.notes} onChange={handleChange} rows={3} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : initial.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
