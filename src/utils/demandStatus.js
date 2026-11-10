// Central demand-status helpers aligned with the CSD AFD manuals.
// Lifecycle: CREATED (pending depot approval) -> APPROVED (payment enabled) -> [PAYMENT_PENDING] -> PROCESSING (payment done, depot verifies)
//            -> SUPPLY_ORDER_ISSUED (URC) -> COMPLETED (Delivery completed)

export const STATUS_LABELS = {
  CREATED: 'Pending depot approval',
  PAYMENT_PENDING: 'Payment pending',
  PROCESSING: 'Pending at depot',
  SUPPLY_ORDER_ISSUED: 'Supply order issued (URC)',
  COMPLETED: 'Delivery completed',
  REJECTED: 'Rejected',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  APPROVED: 'Approved - payment enabled',
};

export const upper = (s) => String(s || '').toUpperCase().replace(/[\s-]+/g, '_');

export const getStatusLabel = (demand) =>
  demand?.statusLabel || STATUS_LABELS[upper(demand?.status)] || String(demand?.status || '').replace(/_/g, ' ');

export const demandId = (d) => d?._id || d?.id;

export const demandAmount = (d) =>
  Number(d?.totalAmount ?? d?.priceBreakup?.net ?? d?.netPayable ?? d?.totalPrice ?? 0);

// Payment is enabled only AFTER the depot approves the demand (stage 1)
export function isPayable(d) {
  const s = upper(d?.status);
  const p = upper(d?.paymentStatus);
  return ['APPROVED', 'PAYMENT_PENDING'].includes(s) && ['', 'UNPAID', 'PENDING', 'FAILED'].includes(p);
}
export const isAwaitingDepotApproval = (d) => upper(d?.status) === 'CREATED';

export const isAwaitingVerification = (d) => upper(d?.paymentStatus) === 'PENDING_VERIFICATION';
export const isPendingAtDepot = (d) => upper(d?.status) === 'PROCESSING';
export const canCancel = (d) => ['CREATED', 'APPROVED', 'PAYMENT_PENDING'].includes(upper(d?.status));
export const isSupplyOrderIssued = (d) => ['SUPPLY_ORDER_ISSUED', 'COMPLETED'].includes(upper(d?.status));

// Depot-side actions
export const depotCanRecordPayment = (d) => upper(d?.status) === 'PROCESSING';
export const depotCanUploadSupplyOrder = (d) => upper(d?.status) === 'PROCESSING';
export const hasPaymentDetails = (d) => !!d?.paymentDetails?.recordedAt;
export const hasSupplyOrderDocs = (d) => {
  const x = d?.supplyOrderDocs || {};
  return !!(x.officialReceiptUrl && x.supplyOrderUrl && x.authorityLetterUrl);
};
export const depotCanApprove = (d) =>
  upper(d?.status) === 'PROCESSING' && upper(d?.paymentStatus) === 'PAID' && hasPaymentDetails(d) && hasSupplyOrderDocs(d);
export const depotCanStage1Approve = (d) => upper(d?.status) === 'CREATED';
export const depotCanReject = (d) => ['CREATED', 'APPROVED', 'PROCESSING'].includes(upper(d?.status));

export const PAYMENT_MODES = {
  DIRECT_BANK_TRANSFER: 'Direct Bank Transfer (NEFT/RTGS)',
  ONLINE_PAYMENT: 'Online Payment (SBIePay / NDML)',
};

export const fmtINR = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

export function paymentMethodLabel(m) {
  const k = upper(m);
  if (k === 'DIRECT_BANK_TRANSFER' || k === 'DIRECT_TRANSFER') return 'Direct bank transfer (NEFT/RTGS)';
  if (['ONLINE_PAYMENT', 'GATEWAY', 'RAZORPAY_ONLINE', 'SBIEPAY', 'NDML'].includes(k)) return 'Online payment';
  return 'Not selected yet'; // legacy values such as "Pending Depot Approval"
}

export const PAYMENT_STATUS_LABELS = {
  UNPAID: 'Not paid',
  PENDING: 'Payment in progress',
  PENDING_VERIFICATION: 'Paid, awaiting depot verification',
  PAID: 'Paid and verified',
  FAILED: 'Payment failed',
  REFUND_PENDING: 'Refund in progress',
  REFUNDED: 'Refunded',
};
export const paymentStatusLabel = (s) => PAYMENT_STATUS_LABELS[upper(s)] || PAYMENT_STATUS_LABELS.UNPAID;
