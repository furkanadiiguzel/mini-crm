import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import { customerService } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import CustomerForm from "../components/CustomerForm";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = () =>
    customerService.get(id).then(({ data }) => setCustomer(data));

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this customer?")) return;
    await customerService.remove(id);
    toast.success("Customer deleted");
    navigate("/customers");
  };

  if (!customer) return <div className="text-gray-400">Loading…</div>;

  const fields = [
    ["Email", customer.email],
    ["Phone", customer.phone || "—"],
    ["Company", customer.company || "—"],
    ["Created", new Date(customer.created_at).toLocaleDateString()],
    ["Updated", new Date(customer.updated_at).toLocaleDateString()],
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <button className="btn-secondary" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{customer.full_name}</h2>
            <StatusBadge status={customer.status} />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setEditOpen(true)}>
              <Edit size={15} /> Edit
            </button>
            <button
              className="btn-secondary text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 pt-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
              <dd className="mt-1 text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {customer.notes && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">Edit Customer</Dialog.Title>
            <CustomerForm
              initial={customer}
              onSuccess={() => { setEditOpen(false); load(); }}
              onCancel={() => setEditOpen(false)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
