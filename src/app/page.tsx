"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";

/**
 * Converts a VAPID public key from Base64 to a Uint8Array.
 * This is necessary for the `applicationServerKey` option when subscribing to push notifications.
 * @param base64String The Base64 encoded VAPID public key.
 * @returns A Uint8Array representation of the key.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Manages push notification subscription and sending test notifications.
 * This component handles browser-side logic for PWAs.
 */
function PushNotificationManager() {
  // State to track if push notifications are supported by the browser
  const [isSupported, setIsSupported] = useState<boolean>(false);
  // State to store the current PushSubscription object
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  // State for the message to be sent in a test notification
  const [message, setMessage] = useState<string>("");

  // Effect hook to check for push notification support and get current subscription
  useEffect(() => {
    async function checkAndGetSubscription() {
      // Check if Service Workers and Push API are supported in the browser
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setIsSupported(true);
        try {
          // Wait for the service worker to be ready (registered by next-pwa)
          const registration = await navigator.serviceWorker.ready;
          console.log("Service Worker ready. Scope:", registration.scope);

          // Get any existing push subscription
          const sub = await registration.pushManager.getSubscription();
          setSubscription(sub); // Update state with the subscription
        } catch (error) {
          console.error(
            "Service Worker or PushManager interaction failed:",
            error
          );
          // Inform the user about potential issues, but avoid blocking the app
          // alert("There was an issue with push notifications. Please try again.");
        }
      } else {
        // If not supported, ensure isSupported is false
        setIsSupported(false);
      }
    }

    // Run the check when the component mounts
    checkAndGetSubscription();
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Subscribes the user to push notifications.
   */
  async function subscribeToPush(): Promise<void> {
    try {
      // Ensure the service worker is ready before attempting to subscribe
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Indicates that notifications will always be visible to the user
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY! // VAPID public key from environment variables
        ),
      });
      setSubscription(sub); // Update state with the new subscription

      // The browser's PushSubscription has a toJSON() method
      // that returns a plain object matching the structure expected by web-push.
      // We pass this plain object to the server action.
      await subscribeUser(sub.toJSON());
      alert("Successfully subscribed to push notifications!");
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      // Handle different error scenarios (e.g., permission denied, invalid key)
      if ((error as DOMException).name === "NotAllowedError") {
        alert(
          "Permission to send push notifications was denied. Please enable them in your browser settings."
        );
      } else {
        alert("Failed to subscribe to push notifications. Please try again.");
      }
    }
  }

  /**
   * Unsubscribes the user from push notifications.
   */
  async function unsubscribeFromPush(): Promise<void> {
    if (subscription) {
      try {
        // Unsubscribe from the browser's PushManager
        await subscription.unsubscribe();
        setSubscription(null); // Clear subscription from state

        // Call the server action to remove the subscription from the database
        await unsubscribeUser();
        alert("Successfully unsubscribed from push notifications.");
      } catch (error) {
        console.error("Failed to unsubscribe:", error);
        alert("Failed to unsubscribe from push notifications.");
      }
    }
  }

  /**
   * Sends a test notification using the subscribed endpoint.
   */
  async function sendTestNotification(): Promise<void> {
    if (subscription) {
      try {
        const result = await sendNotification(message); // Call the server action to send notification
        if (result.success) {
          alert("Test notification sent successfully!");
        } else {
          alert(`Failed to send test notification: ${result.error}`);
        }
        setMessage(""); // Clear message input after sending
      } catch (error) {
        console.error("Error sending test notification:", error);
        alert("An error occurred while sending the test notification.");
      }
    } else {
      alert(
        "Please subscribe to notifications first to send a test notification."
      );
    }
  }

  // Render a message if push notifications are not supported
  if (!isSupported) {
    return (
      <p className='text-red-500'>
        Push notifications are not supported in this browser.
      </p>
    );
  }

  // Render the UI for managing push notifications
  return (
    <div className='p-5 border border-gray-300 rounded-lg my-5'>
      <h3 className='text-lg font-semibold mb-2'>Push Notifications</h3>
      {subscription ? (
        <>
          <p className='mb-4'>You are subscribed to push notifications.</p>
          <button
            onClick={unsubscribeFromPush}
            className='px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer mr-2 hover:bg-red-700 transition-colors'
          >
            Unsubscribe
          </button>
          <input
            type='text'
            placeholder='Enter notification message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='p-2 rounded-md border border-gray-300 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            onClick={sendTestNotification}
            className='px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700 transition-colors'
          >
            Send Test
          </button>
        </>
      ) : (
        <>
          <p className='mb-4'>You are not subscribed to push notifications.</p>
          <button
            onClick={subscribeToPush}
            className='px-5 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors'
          >
            Subscribe to Notifications
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Component to provide guidance for installing the PWA (Add to Home Screen).
 */
function InstallPrompt() {
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  // Effect hook to determine OS and display mode on component mount
  useEffect(() => {
    // Check if the user agent is iOS.
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    // Check if the app is running in standalone mode (i.e., installed as a PWA)
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  // Don't show the install prompt if the app is already installed
  if (isStandalone) {
    return null;
  }

  return (
    <div className='p-5 border border-gray-300 rounded-lg my-5 bg-gray-50'>
      <h3 className='text-lg font-semibold mb-2'>Install App</h3>
      <button className='px-5 py-2 bg-gray-600 text-white rounded-md cursor-pointer hover:bg-gray-700 transition-colors'>
        Add to Home Screen
      </button>
      {isIOS && (
        <p className='mt-2 text-sm text-gray-700'>
          To install this app on your iOS device, tap the share button
          <span role='img' aria-label='share icon'>
            {" "}
            ⎋{" "}
          </span>
          and then &quot;Add to Home Screen&quot;{" "}
          <span role='img' aria-label='plus icon'>
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  );
}

/**
 * Main page component for the application, combining push notification management
 * and install prompt functionality.
 */
export default function Page() {
  return (
    <div className='font-sans p-5'>
      <h1 className='text-3xl font-bold mb-6'>Platter Order App</h1>
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  );
}
