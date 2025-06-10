"use client";

import { useState, useEffect } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/app/actions";

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
  const [showInput, setShowInput] = useState<boolean>(false);
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

      const result = await subscribeUser(sub.toJSON());
      if (result.success) {
        alert("Successfully subscribed to push notifications!");
      } else {
        alert(`Failed to save subscription to database: ${result.error}`);
      }
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
        const result = await unsubscribeUser(subscription.endpoint);
        if (result.success) {
          setSubscription(null);
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
        setShowInput(false);
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
        {/* Use text-muted-foreground for non-supported icon */}
        <span
          className='text-muted-foreground text-2xl'
          title='Push notifications not supported'
        >
          🔔
        </span>{" "}
        <span className='text-xs text-muted-foreground mt-1'>
          Not Supported
        </span>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center group relative'>
      {subscription ? (
        <>
          <button
            onClick={() => setShowInput(!showInput)}
            // Use text-primary for subscribed icon, with hover
            className='text-primary text-2xl hover:text-primary-foreground transition-colors cursor-pointer'
            title='Send Test Notification'
          >
            🔔
          </button>
          <span className='text-xs text-primary mt-1'>Subscribed</span>
          {showInput && (
            // Use bg-card for the popover background, border-border, text-foreground
            <div className='absolute top-full mt-2 w-56 p-2 bg-card border border-border rounded-md shadow-lg z-10 flex flex-col items-start text-foreground'>
              <input
                type='text'
                placeholder='Test message'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                // Use input-specific classes
                className='w-full p-1 text-xs border border-input bg-input rounded-sm mb-2 focus:outline-none focus:ring-1 focus:ring-ring'
              />
              <div className='flex justify-end w-full space-x-2'>
                {/* Use button variants for these */}
                <button
                  onClick={handleSendTest}
                  className='px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors'
                >
                  Send
                </button>
                <button
                  onClick={handleUnsubscribe}
                  className='px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs hover:bg-secondary/80 transition-colors'
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
            // Use text-muted-foreground for unsubscribe icon
            className='text-muted-foreground text-2xl hover:text-foreground transition-colors cursor-pointer'
            title='Subscribe to Push Notifications'
          >
            🔕
          </button>
          <span className='text-xs text-muted-foreground mt-1'>Subscribe</span>
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
    useState<boolean>(false);

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
        {/* Consider a more theme-aware color for success, maybe a muted green or accent-foreground */}
        <span
          className='text-accent-foreground text-2xl'
          title='App is installed'
        >
          ✅
        </span>{" "}
        <span className='text-xs text-accent-foreground mt-1'>Installed</span>
      </div>
    );
  }

  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div className='flex flex-col items-center group relative'>
      <button
        onClick={handleInstallClick}
        // Use text-muted-foreground for install icon
        className='text-muted-foreground text-2xl hover:text-foreground transition-colors cursor-pointer'
        title='Install App'
      >
        {" "}
        📱
      </button>
      <span className='text-xs text-muted-foreground mt-1'>Install App</span>

      {showIOSInstructions && isIOS && (
        // Use bg-card, border-border, text-foreground
        <div className='absolute top-full mt-2 w-64 p-3 bg-card border border-border rounded-md shadow-lg z-10'>
          <p className='text-xs text-foreground'>
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
            // Use secondary button styling
            className='mt-2 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs hover:bg-secondary/80 transition-colors w-full'
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
    // Use bg-card for header, text-card-foreground for title, border-border
    <header className='w-full bg-card shadow-sm p-4 flex justify-between items-center border-b border-border'>
      <h1 className='text-2xl font-bold text-card-foreground'>
        Platter Order App
      </h1>
      <div className='flex items-center space-x-6'>
        <PushNotificationControl />
        <InstallAppControl />
      </div>
    </header>
  );
}
