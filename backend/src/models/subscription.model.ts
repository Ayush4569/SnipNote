import { Schema, model, Document, Model } from "mongoose";

interface subscriptionMethods {
    canGeneratePdf: () => boolean
    isPlanExpired: () => boolean
    incrementPdfUsage: () => void
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
    razorpayCustomerId: {
        type: String,
        required: [true, 'razorpay customer id is required']
    },
    plan: {
        type: String,
        enum: ['basic', 'pro'],
        required: [true, 'plan is required']
    },
    amount: {
        type: Number,
        required: [true, 'amount is required']
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
    paymentMethod: {
        type: String,
        required: [true, 'payment method is required']
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'failed', 'pending'],
        default: 'active'
    },
    expiresAt: {
        type: Date,
        required: [true, 'expiration date is required']
    }
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
subscriptionSchema.methods.incrementPdfUsage = async function () {
    this.pdfUsed++
    return await this.save()
}



export const Subscription = model<subscription, Model<subscription, {}, subscriptionMethods>>('Subscription', subscriptionSchema);
