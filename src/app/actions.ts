// app/actions.ts
"use server";

import webPush from "web-push";
import type { PushSubscription as WebPushSubscription } from "web-push";

// Define a type for what we expect from the client-side PushSubscription.toJSON().
// This aligns with the standard DOM PushSubscriptionJSON interface.
interface ClientPushSubscriptionJSON {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

// Define a common interface for errors that might have a statusCode,
// which is typical for web-push library errors.
interface WebPushErrorWithStatusCode extends Error {
  statusCode?: number;
}

// Ensure VAPID keys are set (from .env)
if (
  !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  !process.env.VAPID_PRIVATE_KEY
) {
  console.error("VAPID keys are missing. Push notifications might not work.");
  // In a production app, you might want to throw an error or exit if critical
} else {
  webPush.setVapidDetails(
    "mailto:ckbeamsoftware@gmail.com", // Your contact email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// IMPORTANT: This 'subscription' variable will NOT persist across serverless function invocations
// In a production environment, you MUST store subscriptions in a database (e.g., Supabase)
let subscription: WebPushSubscription | null = null; // Stores the subscription in web-push's expected format

/**
 * Subscribes a user to push notifications by storing their subscription details.
 * In a real application, this would persist the subscription to a database.
 * @param sub The push subscription object from the client-side.
 */
export async function subscribeUser(sub: ClientPushSubscriptionJSON) {
  // Runtime validation to ensure the subscription has the necessary properties
  // before attempting to use it with web-push.
  if (!sub.endpoint || !sub.keys?.auth || !sub.keys?.p256dh) {
    console.error("Received invalid push subscription format:", sub);
    throw new Error("Invalid push subscription: missing endpoint or keys.");
  }

  // If validation passes, we can safely cast it to web-push's stricter type.
  // This asserts to TypeScript that these properties are now present.
  subscription = sub as WebPushSubscription;

  // In a production environment, you would store this `subscription` object
  // in your database (e.g., Supabase Firestore/PostgreSQL).
  // Example (hypothetical): await db.subscriptions.create({ data: subscription });
  console.log("User subscribed:", subscription);
  return { success: true };
}

/**
 * Unsubscribes a user from push notifications.
 * In a real application, this would remove the subscription from a database.
 */
export async function unsubscribeUser() {
  subscription = null; // Clear the in-memory subscription
  // In a production environment, you would remove the corresponding subscription
  // from your database.
  // Example (hypothetical): await db.subscriptions.delete({ where: { endpoint: ... } });
  console.log("User unsubscribed.");
  return { success: true };
}

/**
 * Sends a push notification to the currently stored subscription.
 * @param message The message body for the notification.
 */
export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error("No subscription available. Please subscribe first.");
  }

  try {
    // Send the notification using the web-push library
    await webPush.sendNotification(
      subscription, // This is now correctly typed as WebPushSubscription
      JSON.stringify({
        title: "Platter Order Update",
        body: message,
        icon: "/icon-192x192.png", // Ensure this path is correct and icon exists
        badge: "/badge.png", // Optional: Ensure this path is correct and icon exists for badges
      })
    );
    console.log("Notification sent successfully!");
    return { success: true };
  } catch (error: unknown) {
    // Changed 'any' to 'unknown'
    console.error("Error sending push notification:", error);

    let errorMessage = "Failed to send notification";
    // Check if the error object has a 'message' property
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Error).message === "string"
    ) {
      errorMessage = (error as Error).message;
    }

    // Check if the error is a WebPushErrorWithStatusCode type to access 'statusCode'
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as WebPushErrorWithStatusCode).statusCode === "number"
    ) {
      const webPushError = error as WebPushErrorWithStatusCode;
      // Handle specific push service errors, e.g., subscription expired (HTTP 410 Gone)
      if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
        console.warn(
          "Subscription expired or no longer exists. It should be removed from the database."
        );
        // In a production app, you would also remove the invalid subscription from your database here.
        errorMessage = `Notification failed (Subscription expired/invalid): ${errorMessage}`;
      }
    }

    return { success: false, error: errorMessage };
  }
}
