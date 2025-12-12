
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Random 4 chars
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `ORD-${year}${month}${day}-${random}`;
};
