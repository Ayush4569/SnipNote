import Razorpay from "razorpay";

export const razorpayService = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})