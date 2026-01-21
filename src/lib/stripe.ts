import Stripe from "stripe";

// If STRIPE_SECRET_KEY is not provided, we will mock the behavior in the API route
// But we still initialize the class if key exists to avoid runtime errors
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;
