const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,       // snapshot at order time
    image: String,      // snapshot at order time
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variation: {
        name: String,
        option: String,
        priceModifier: Number,
    },
});

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [orderItemSchema],
        subtotal: { type: Number, required: true },
        deliveryFee: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        deliveryType: {
            type: String,
            enum: ['pickup', 'delivery'],
            required: true,
        },
        pickupLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupLocation' },
        deliveryAddress: {
            street: String,
            building: String,
            landmark: String,
            coordinates: { lat: Number, lng: Number },
        },
        customerPhone: { type: String, required: true },
        customerName: String,
        paymentMethod: { type: String, default: 'mpesa' },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        mpesaReceiptNumber: String,
        mpesaCheckoutRequestId: String,
        orderStatus: {
            type: String,
            enum: ['awaiting_payment', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
            default: 'awaiting_payment',
        },
        statusHistory: [
            {
                status: String,
                note: String,
                updatedAt: { type: Date, default: Date.now },
                updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            },
        ],
        notes: String,
        cancelReason: String,
    },
    { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `BP-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
