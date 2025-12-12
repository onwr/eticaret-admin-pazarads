
import { Order, FestConsignmentPayload, FestAmountType, ShippingStatus, FestCargoStatus } from '../../types';

export const mapOrderToFestPayload = (
  order: Order, 
  branchCode: string | number, 
  codAmount?: number
): FestConsignmentPayload => {
  // Determine Amount Type
  let amountTypeId = FestAmountType.UCRET_ALICI; // Default
  
  if (order.paymentMethod === 'COD') {
     // If payment is Cash on Delivery
     amountTypeId = FestAmountType.KAPIDA_NAKIT;
  } else if (order.paymentMethod === 'CC_ON_DOOR') {
     amountTypeId = FestAmountType.KAPIDA_KREDI_KARTI;
  } else {
     // Prepaid or free shipping
     amountTypeId = FestAmountType.TOPLU_GONDERI; // Sender pays shipping, no collection
  }

  // Determine Collection Amount
  const amount = codAmount !== undefined ? codAmount.toFixed(2) : order.totalAmount.toFixed(2);

  return {
    customer: order.customer?.name || 'Unknown',
    province_name: order.customer?.city || '',
    county_name: order.customer?.district || '',
    district: order.customer?.district || '', // Some integrations map neighborhood here
    address: order.customer?.address || '',
    telephone: order.customer?.phone || '',
    branch_code: branchCode,
    consignment_type_id: 103, // Standard package
    amount_type_id: amountTypeId,
    amount: amount,
    order_number: order.orderNumber,
    quantity: 1, // Defaulting to 1 package per order for simplicity
    summary: `${order.product?.name} (${order.variantSelection || 'Standard'})`
  };
};

export const mapFestStatusToInternal = (statuNo: string): ShippingStatus => {
  if (statuNo === FestCargoStatus.TESLIM_EDILDI) return ShippingStatus.DELIVERED;
  
  // Return statuses (20-24, 50, 60)
  if (['20', '21', '22', '23', '24', '50', '60'].includes(statuNo)) return ShippingStatus.RETURNED;
  
  // In Transit (40, 41, 42, 30)
  if (['40', '41', '42', '30'].includes(statuNo)) return ShippingStatus.SHIPPED;
  
  return ShippingStatus.PREPARING;
};

// Check if shipment needs intervention (problematic)
export const isShipmentProblematic = (statuNo: string): boolean => {
    // 20-24: Returns
    // 30: Delivery Failed - Retry
    // 50: Delivery Failed
    // 60: Delivery Failed (Branch)
    const problematicCodes = ['20', '21', '22', '23', '24', '30', '50', '60'];
    return problematicCodes.includes(statuNo);
};
