import { useEffect } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger", // danger | warning | info
  loading = false,
}) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <FiAlertTriangle className="w-6 h-6 text-red-600" />,
      iconBg: "bg-red-100",
      buttonBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: <FiAlertTriangle className="w-6 h-6 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
    info: {
      icon: <FiAlertTriangle className="w-6 h-6 text-blue-600" />,
      iconBg: "bg-blue-100",
      buttonBg: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div
              className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}
            >
              {config.icon}
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3
                className="text-lg font-semibold leading-6 text-gray-900"
                id="modal-title"
              >
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-3 sm:w-auto ${config.buttonBg} ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
        </div>
        
        {/* Close X (optional, mostly for mobile) */}
        {!loading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
