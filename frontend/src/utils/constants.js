export const ORDER_STATUSES = {
    awaiting_payment: { label: 'Awaiting Payment', color: 'text-yellow-400 bg-yellow-400/10' },
    confirmed: { label: 'Confirmed', color: 'text-blue-400   bg-blue-400/10' },
    processing: { label: 'Processing', color: 'text-purple-400 bg-purple-400/10' },
    ready: { label: 'Ready', color: 'text-cyan-400   bg-cyan-400/10' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-400 bg-orange-400/10' },
    delivered: { label: 'Delivered', color: 'text-green-400  bg-green-400/10' },
    cancelled: { label: 'Cancelled', color: 'text-red-400    bg-red-400/10' },
};

export const PAYMENT_STATUSES = {
    pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-400/10' },
    paid: { label: 'Paid', color: 'text-green-400  bg-green-400/10' },
    failed: { label: 'Failed', color: 'text-red-400    bg-red-400/10' },
    refunded: { label: 'Refunded', color: 'text-blue-400   bg-blue-400/10' },
};

export const DELIVERY_TYPES = {
    pickup: { label: 'Campus Pickup', icon: '🏫' },
    delivery: { label: 'Delivery', icon: '🚚' },
};

export const ROLES = {
    customer: 'customer',
    admin: 'admin',
};

export const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest' },
    { value: 'price', label: 'Price: Low → High' },
    { value: '-price', label: 'Price: High → Low' },
    { value: '-rating', label: 'Top Rated' },
    { value: '-soldCount', label: 'Best Selling' },
];
