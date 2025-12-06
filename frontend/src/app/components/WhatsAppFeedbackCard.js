"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

const toneMap = {
  success: {
    border: "border-emerald-200",
    badge: "bg-emerald-500 text-white",
    Icon: CheckCircle2,
  },
  warning: {
    border: "border-amber-200",
    badge: "bg-amber-500 text-white",
    Icon: AlertTriangle,
  },
  error: {
    border: "border-rose-200",
    badge: "bg-rose-500 text-white",
    Icon: XCircle,
  },
};

export default function WhatsAppFeedbackCard({ feedback, onClose, duration = 6000 }) {
  const tone = toneMap[feedback?.status] || toneMap.success;

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }
    if (!duration) {
      return undefined;
    }
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [feedback?.id, duration, onClose]);

  if (!feedback) {
    return null;
  }

  const Icon = tone.Icon;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:justify-end sm:px-8">
      <div className={`pointer-events-auto w-full max-w-md rounded-3xl border ${tone.border} bg-white/95 p-5 shadow-2xl backdrop-blur`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.badge}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-400">Atendimento</p>
            <p className="text-lg font-bold text-gray-900">{feedback.title}</p>
            <p className="mt-1 text-sm text-gray-600">{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            aria-label="Fechar aviso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
