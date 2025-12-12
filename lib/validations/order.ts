
import { OrderFormData } from '../../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateOrderForm = (data: OrderFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Full Name is required (min 2 chars)' });
  }

  // Simple phone validation
  if (!data.phone || data.phone.trim().length < 10) {
    errors.push({ field: 'phone', message: 'Valid Phone Number is required' });
  }

  if (!data.address || data.address.trim().length < 10) {
    errors.push({ field: 'address', message: 'Full Address is required (min 10 chars)' });
  }

  if (!data.city) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!data.district) {
    errors.push({ field: 'district', message: 'District is required' });
  }

  if (!data.priceId) {
    errors.push({ field: 'price', message: 'Please select an offer' });
  }

  return errors;
};
