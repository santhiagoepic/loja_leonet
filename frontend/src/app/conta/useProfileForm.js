"use client";

import { useEffect, useState } from "react";

const normalizer = (value = "") => value.trim();

const normalizePhone = (value = "") => value.replace(/\D/g, "");

export default function useProfileForm(initialProfile) {
  const [formState, setFormState] = useState(() => ({
    full_name: normalizer(initialProfile?.full_name || initialProfile?.nome || ""),
    phone_number: initialProfile?.phone_number || initialProfile?.telefone || "",
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormState({
      full_name: normalizer(initialProfile?.full_name || initialProfile?.nome || ""),
      phone_number: initialProfile?.phone_number || initialProfile?.telefone || "",
    });
  }, [initialProfile?.full_name, initialProfile?.phone_number, initialProfile?.nome, initialProfile?.telefone]);

  const updateField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!normalizer(formState.full_name)) {
      nextErrors.full_name = "Informe seu nome completo.";
    }
    const digits = normalizePhone(formState.phone_number);
    if (!digits || digits.length < 10) {
      nextErrors.phone_number = "Informe um telefone com DDD.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return {
    formState,
    updateField,
    errors,
    setErrors,
    submitting,
    setSubmitting,
    validate,
  };
}
