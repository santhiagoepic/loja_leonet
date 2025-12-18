'use client';

const baseMessages = {
  success: {
    title: 'Pedido enviado',
    message: 'Um atendente vai continuar o atendimento com você pelo WhatsApp.',
  },
  error: {
    title: 'Não conseguimos enviar',
    message: 'Tente novamente em instantes ou fale com nosso suporte.',
  },
  warning: {
    title: 'Quase lá',
    message: 'Atualize suas informações para receber atendimento pelo WhatsApp.',
  },
};

function normalizeFeedback(feedback, fallbackStatus = 'success', fallbackMessage) {
  const status = feedback?.status || fallbackStatus;
  const defaults = baseMessages[status] || baseMessages.success;
  return {
    status,
    title: feedback?.title || defaults.title,
    message: feedback?.message || fallbackMessage || defaults.message,
  };
}

export async function contactStoreViaWhatsApp(product, { requestFn } = {}) {
  if (!product?.id) {
    throw new Error('Produto inválido para envio.');
  }
  if (typeof requestFn !== 'function') {
    throw new Error('requestFn é obrigatório para enviar via WhatsApp.');
  }

  try {
    const response = await requestFn('/api/whatsapp/orders/', {
      method: 'POST',
      body: { product_id: product.id },
    });
    const feedback = normalizeFeedback(response?.feedback, 'success');
    return {
      ok: feedback.status !== 'error',
      feedback,
      order: response?.order,
    };
  } catch (error) {
    return {
      ok: false,
      feedback: normalizeFeedback(null, 'error', error.message),
    };
  }
}

export function buildWarningFeedback(message) {
  return normalizeFeedback({ status: 'warning', message }, 'warning');
}

export function buildWhatsAppUrl(product) {
  if (!product) return 'https://wa.me/';
  const direct = product.link_whatsapp || product.whatsapp_link;
  if (direct) return direct;
  const name = product.nome || product.name || 'um produto';
  const text = encodeURIComponent(`Olá, tenho interesse em ${name}.`);
  return `https://wa.me/?text=${text}`;
}

export function openWhatsApp(product) {
  if (typeof window === 'undefined') return;
  const url = buildWhatsAppUrl(product);
  window.open(url, '_blank', 'noopener');
}
