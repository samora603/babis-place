const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'Home' }, // Home, Hostel, etc.
    street: { type: String, required: true },
    building: String,
    landmark: String,
    coordinates: {
        lat: Number,
        lng: Number,
    },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\+254[0-9]{9}$/, 'Phone must be in format +254XXXXXXXXX'],
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            sparse: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
        },
        passwordHash: { type: String },
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        addresses: [addressSchema],
        profileImage: String,
        refreshToken: String,
    },
    { timestamps: true }
);

// Hash password before save if modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash') || !this.passwordHash) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

// Never return sensitives
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.refreshToken;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
