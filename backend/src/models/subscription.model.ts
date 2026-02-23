import { Schema, model, Document, Model, ClientSession } from "mongoose";

interface subscriptionMethods {
    canGeneratePdf: () => boolean
    isPlanExpired: () => boolean
    incrementPdfUsage: (session?:ClientSession) => Promise<this>
}

interface subscription extends subscriptionMethods, Document {
    razorPaySubscriptionId: string
    razorpayPlanId: string
    razorpayCustomerId: string
    plan: string
    amount: number
    currency: string
    userId: Schema.Types.ObjectId
    pdfLimit: number
    pdfUsed: number
    paymentMethod: string
    status: string
    expiresAt: Date
    startAt: Date
    renewsAt: Date
    lastPaymentId: string
}

const subscriptionSchema: Schema<subscription> = new Schema({
    razorPaySubscriptionId: {
        type: String,
        required: [true, 'subscription id is required']
    },
    razorpayPlanId: {
        type: String,
        required: [true, 'razorpay plan id is required']
    },
    razorpayCustomerId: String,
    plan: {
        type: String,
        enum: ['basic', 'pro'],
        default: 'basic'
    },
    amount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'user id is required']
    },
    pdfLimit: {
        type: Number,
        default: 25
    },
    pdfUsed: {
        type: Number,
        default: 0
    },
    paymentMethod: String,
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'failed', 'pending', 'halted'],
        default: 'active'
    },
    startAt: Date,
    renewsAt: Date,
    lastPaymentId: String,
    expiresAt: Date,
}, { timestamps: true })

subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index({ razorPaySubscriptionId: 1 })
subscriptionSchema.index({ expiresAt: 1 })

subscriptionSchema.methods.isPlanExpired = function () {
    return this.expiresAt < new Date()
}

subscriptionSchema.methods.canGeneratePdf = function () {
    return this.status === 'active' &&
        !this.isPlanExpired() &&
        this.pdfUsed < this.pdfLimit
}
subscriptionSchema.methods.incrementPdfUsage = async function (session?:ClientSession) {
    this.pdfUsed++
    return  this.save(session ? { session } : {});
}



export const Subscription = model<subscription, Model<subscription, {}, subscriptionMethods>>('Subscription', subscriptionSchema);
