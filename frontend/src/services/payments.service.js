 /**
 * payments.service.js
 * Payment gateway scaffolding (Razorpay / Stripe).
 *
 * NOTE:
 * - This module contains frontend-facing wrappers that call backend endpoints which integrate with payment providers.
 * - Do NOT place secret keys on frontend; create backend endpoints that call provider SDKs and return client tokens/orders.
 *
 * Example flow (Razorpay):
 * 1. POST /payments/create-order  { amount, currency, bookingId } -> returns { orderId, amount, currency }
 * 2. Frontend uses provider SDK (Razorpay/Stripe) to show payment UI.
 * 3. On success, capture or notify backend: POST /payments/verify -> backend verifies and updates booking/payment status.
 *
 * Example flow (Stripe Checkout):
 * 1. POST /payments/checkout-session -> returns { url } -> redirect frontend to url
 * 2. Webhook on backend confirms payment and updates booking
 */

import api from './apiClient';

const paymentsService = {
  // Create an order (backend creates order with provider & returns client-side order/token)
  createOrder: (payload) => api.post('/payments/create-order', payload),

  // For checkout (Stripe) - backend returns checkout url
  createCheckoutSession: (payload) => api.post('/payments/create-checkout-session', payload),

  // Verify payment (backend-side verification recommended)
  verifyPayment: (payload) => api.post('/payments/verify', payload),

  // List payments for admin
  list: (params = {}) => api.get('/payments', { params }),

  // Capture an authorized payment (if your provider requires explicit capture)
  capture: (paymentId) => api.post(`/payments/${paymentId}/capture`),

  // Refund
  refund: (paymentId, payload) => api.post(`/payments/${paymentId}/refund`, payload)
};

export default paymentsService;
