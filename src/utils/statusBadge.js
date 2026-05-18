export const groceryStatusClass = (status) => {
  if (status === 'Delivered') return 'accepted';
  if (status === 'Cancelled') return 'rejected';
  if (status === 'Out for Delivery' || status === 'Processing') return 'open';
  return 'pending';
};

export const mealStatusClass = (status) => {
  if (status === 'Delivered') return 'accepted';
  if (status === 'Cancelled') return 'rejected';
  return 'pending';
};
