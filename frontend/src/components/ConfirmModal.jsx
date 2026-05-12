import { Dialog } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ open, onClose, onConfirm, loading, customer }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 shrink-0">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <Dialog.Title className="text-base font-semibold text-gray-900">
                Müşteriyi Sil
              </Dialog.Title>
              <p className="text-sm text-gray-500 mt-1">
                Bu işlem geri alınamaz.
              </p>
            </div>
          </div>

          {/* Customer info */}
          {customer && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 text-sm">
              <p className="font-medium text-gray-900">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-gray-500 mt-0.5">{customer.email}</p>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            Bu müşteriyi silmek istediğinize emin misiniz?
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Siliniyor…" : "Sil"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
