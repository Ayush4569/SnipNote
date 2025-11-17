import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/apiError";
import { Subscription } from "../models/subscription.model";
import { razorpayService } from "../services/razorpay.service";
import { User } from "models/user.model";
import mongoose from "mongoose";
import crypto from 'crypto'
import { addMonths } from "date-fns";

const createSubscription = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id || !req.user.email) {
        throw new CustomError(400, 'Unauthorized')
    }


    const { id, name, email } = req.user

    const existingSubscription = await Subscription.findOne({
        userId: id
    })

    if (existingSubscription?.status === 'active') {
        throw new CustomError(400, 'You already have an active subscription')
    }

    if (existingSubscription?.status && ['pending', 'expired', 'cancelled', 'failed'].includes(existingSubscription.status)) {
        await razorpayService.subscriptions.cancel(existingSubscription.razorPaySubscriptionId, true)

        await User.findByIdAndUpdate(id, {
            isPro: false
        })

        const deletedSub = await Subscription.deleteOne({
            razorPaySubscriptionId: existingSubscription.razorPaySubscriptionId
        })

        if (!deletedSub) {
            throw new CustomError(500, 'Failed to cleanup existing subscription')
        }
    }

    const newCustomer = await razorpayService.customers.create({
        email,
        name,
        notes: {
            userId: new mongoose.Types.ObjectId(id).toString()
        }
    })

    const subscription = await razorpayService.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID!,
        customer_notify: 1,
        total_count: 12,
        notes: {
            userId: new mongoose.Types.ObjectId(id).toString(),
        },
    })

    await Subscription.create({
        razorPaySubscriptionId: subscription.id,
        razorpayPlanId: process.env.RAZORPAY_PLAN_ID!,
        razorpayCustomerId: subscription.customer_id,
        userId: id,
        status: "pending",
        plan: 'pro'
    });

    return res.status(200).json({
        subscriptionId: subscription.id,
        customerId: newCustomer.id,
        keyId: process.env.RAZORPAY_KEY_ID,
    });
})

const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    if ([req.user, req.user?.id, req.user?.email].some(item => !item)) {
        throw new CustomError(400, 'Unauthorized')
    }
    const userSubscription = await Subscription.findOne({
        userId: req.user!.id,
    }).select('+razorPaySubscriptionId')

    if (!userSubscription?.razorPaySubscriptionId) {
        throw new CustomError(400, 'No subscriptions found for user')
    }

    const subscription = await razorpayService.subscriptions.fetch(userSubscription.razorPaySubscriptionId);
    if (!subscription) {
        throw new CustomError(400, 'Subscription not found')
    }
    await razorpayService.subscriptions.cancel(userSubscription.razorPaySubscriptionId, 1);
    await User.updateOne({
        id: req.user!.id
    }, {
        isPro: false
    })
    return res.json({ success: true, message: "Subscription cancelled successfully" });
})

const webhook = async (req: Request, res: Response) => {
    try {
        const rawBody = req.body.toString();
        const signature = req.headers["x-razorpay-signature"] as string;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const data = JSON.parse(rawBody);
        const event = data.event;


        if (event === "subscription.activated") {
            const sub = data.payload.subscription.entity;

            await Subscription.updateOne(
                { subscriptionId: sub.id },
                {
                    status: "active",
                    startAt: new Date(sub.start_at * 1000),
                    renewAt: new Date(sub.charge_at * 1000)
                }
            );

            await User.updateOne(
                { _id: sub.notes.userId },
                { isPro: true }
            );
        }


        if (event === "subscription.cancelled") {
            const sub = data.payload.subscription.entity;

            await Subscription.updateOne(
                { subscriptionId: sub.id },
                { status: "cancelled" }
            );

            await User.updateOne(
                { _id: sub.notes.userId },
                { isPro: false }
            );
        }


        if (event === "payment.captured") {
            const payment = data.payload.payment.entity;

            await Subscription.updateOne(
                { subscriptionId: payment.notes.subscription_id },
                {
                    lastPaymentId: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    method: payment.method,
                    status: "active",
                    expiresAt: addMonths(new Date(), 1)
                }
            );
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Webhook error:", err);
        return res.status(500).json({ success: false });
    }
};


export {
    createSubscription,
    cancelSubscription,
    webhook
}