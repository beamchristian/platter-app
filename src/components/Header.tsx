// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/app/actions"; // Adjust import path

// Helper function remains the same
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

function PushNotificationControl() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [showInput, setShowInput] = useState<boolean>(false); // State to control test message input visibility
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function checkAndGetSubscription() {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setIsSupported(true);
        try {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          setSubscription(sub);
        } catch (error) {
          console.error(
            "Service Worker or PushManager interaction failed:",
            error
          );
        }
      } else {
        setIsSupported(false);
      }
    }
    checkAndGetSubscription();
  }, []);

  const handleSubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);

      // *** ADD THIS BLOCK TO SEND TO DATABASE ***
      const result = await subscribeUser(sub.toJSON());
      if (result.success) {
        alert("Successfully subscribed to push notifications!");
      } else {
        // Handle the case where saving to DB failed
        alert(`Failed to save subscription to database: ${result.error}`);
        // You might want to unsubscribe from the browser if DB save fails
        // await sub.unsubscribe();
        // setSubscription(null);
      }
      // *****************************************
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      if ((error as DOMException).name === "NotAllowedError") {
        alert("Permission denied. Enable notifications in browser settings.");
      } else {
        alert("Failed to subscribe. Please try again.");
      }
    }
  };

  const handleUnsubscribe = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        // Pass the endpoint to the server action for deletion
        const result = await unsubscribeUser(subscription.endpoint); // <-- FIX THIS LINE
        if (result.success) {
          setSubscription(null); // Clear local state only if server deletion was successful
          alert("Successfully unsubscribed from push notifications.");
        } else {
          alert(`Failed to unsubscribe: ${result.error}`);
        }
      } catch (error) {
        console.error("Failed to unsubscribe:", error);
        alert("Failed to unsubscribe.");
      }
    }
  };

  const handleSendTest = async () => {
    if (subscription) {
      try {
        const result = await sendNotification(message);
        if (result.success) {
          alert("Test notification sent successfully!");
        } else {
          alert(`Failed to send test: ${result.error}`);
        }
        setMessage("");
        setShowInput(false); // Hide input after sending
      } catch (error) {
        console.error("Error sending test notification:", error);
        alert("An error occurred while sending test notification.");
      }
    } else {
      alert("Please subscribe first to send a test notification.");
    }
  };

  if (!isSupported) {
    return (
      <div className='flex flex-col items-center group relative'>
        <span
          className='text-gray-400 text-2xl'
          title='Push notifications not supported'
        >
          🔔
        </span>{" "}
        {/* Bell icon faded */}
        <span className='text-xs text-gray-500 mt-1'>Not Supported</span>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center group relative'>
      {subscription ? (
        <>
          <button
            onClick={() => setShowInput(!showInput)} // Toggle input visibility
            className='text-blue-600 text-2xl hover:text-blue-700 transition-colors cursor-pointer'
            title='Send Test Notification'
          >
            🔔
          </button>
          <span className='text-xs text-blue-600 mt-1'>Subscribed</span>
          {showInput && (
            <div className='absolute top-full mt-2 w-56 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 flex flex-col items-start'>
              <input
                type='text'
                placeholder='Test message'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='w-full p-1 text-xs border border-gray-300 rounded-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400'
              />
              <div className='flex justify-end w-full space-x-2'>
                <button
                  onClick={handleSendTest}
                  className='px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 transition-colors'
                >
                  Send
                </button>
                <button
                  onClick={handleUnsubscribe}
                  className='px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors'
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={handleSubscribe}
            className='text-gray-500 text-2xl hover:text-gray-600 transition-colors cursor-pointer'
            title='Subscribe to Push Notifications'
          >
            🔕
          </button>
          <span className='text-xs text-gray-500 mt-1'>Subscribe</span>
        </>
      )}
    </div>
  );
}

function InstallAppControl() {
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] =
    useState<boolean>(false); // State for iOS popover

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      // @ts-expect-error aok
      deferredPrompt.prompt();
      // @ts-expect-error aok
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) {
    return (
      <div className='flex flex-col items-center'>
        <span className='text-green-600 text-2xl' title='App is installed'>
          ✅
        </span>{" "}
        {/* Checkmark icon */}
        <span className='text-xs text-green-600 mt-1'>Installed</span>
      </div>
    );
  }

  // Only show install button if not iOS OR if iOS AND we have a prompt or need to show instructions
  if (!deferredPrompt && !isIOS) {
    return null; // Don't show anything if no install prompt available for non-iOS
  }

  return (
    <div className='flex flex-col items-center group relative'>
      <button
        onClick={handleInstallClick}
        className='text-gray-500 text-2xl hover:text-gray-600 transition-colors cursor-pointer'
        title='Install App'
      >
        {" "}
        📱 {/* Mobile phone icon */}
      </button>
      <span className='text-xs text-gray-500 mt-1'>Install App</span>

      {showIOSInstructions && isIOS && (
        <div className='absolute top-full mt-2 w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg z-10'>
          <p className='text-xs text-gray-700'>
            To install on iOS, tap the share button
            <span role='img' aria-label='share icon' className='mx-0.5'>
              {" "}
              ⎋{" "}
            </span>
            and then &quot;Add to Home Screen&quot;
            <span role='img' aria-label='plus icon' className='mx-0.5'>
              {" "}
              ➕{" "}
            </span>
            .
          </p>
          <button
            onClick={() => setShowIOSInstructions(false)}
            className='mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors w-full'
          >
            Got It
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header className='w-full bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-100'>
      <h1 className='text-2xl font-bold text-gray-900'>Platter Order App</h1>
      <div className='flex items-center space-x-6'>
        {" "}
        {/* Increased space-x */}
        <PushNotificationControl />
        <InstallAppControl />
      </div>
    </header>
  );
}
