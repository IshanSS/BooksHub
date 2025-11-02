import React, { useState } from "react";

const PUBLIC_KEY = (process.env.REACT_APP_KHALTI_PUBLIC_KEY || "").trim();
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

function isValidPublicKey(k) {
  return typeof k === "string" && k.length >= 20 && !/replace/i.test(k);
}

export default function KhaltiPaymentButton({
  amount = 100,
  productName,
  productId,
  productSold = false,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  // debug log so you can verify the key used in the browser console
  // eslint-disable-next-line no-console
  console.info(
    "KhaltiPaymentButton - using public key:",
    PUBLIC_KEY ? PUBLIC_KEY : "(none)"
  );

  if (!isValidPublicKey(PUBLIC_KEY)) {
    return (
      <button
        disabled
        style={{
          padding: 10,
          borderRadius: 6,
          background: "#ccc",
          color: "#333",
          border: "none",
        }}
        title="Missing or invalid Khalti public key"
      >
        Pay (no public key)
      </button>
    );
  }

  const handleClick = () => {
    if (productSold) {
      alert("This book is already sold.");
      return;
    }
    if (!window.KhaltiCheckout) {
      const script = document.createElement("script");
      script.src = "https://khalti.com/static/khalti-checkout.js";
      script.onload = openKhalti;
      script.onerror = () => {
        console.error("Failed to load Khalti script");
        alert(
          "Failed to load Khalti checkout script. Check network or console."
        );
      };
      document.body.appendChild(script);
    } else {
      openKhalti();
    }
  };

  const openKhalti = () => {
    const amountPaisa = Math.round(Number(amount) * 100);
    const config = {
      publicKey: PUBLIC_KEY,
      productIdentity: productId || "product-001",
      productName: productName || "Product",
      productUrl: window.location.origin,
      paymentPreference: [
        "KHALTI",
        "EBANKING",
        "MOBILE_BANKING",
        "CONNECT_IPS",
        "SCT",
      ],
      eventHandler: {
        async onSuccess(payload) {
          setLoading(true);
          try {
            const resp = await fetch(`${API_URL}/api/payment/khalti/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: payload.token,
                amount: payload.amount,
                productId,
              }),
            });
            const data = await resp.json();
            if (resp.ok && data.success) {
              alert("Payment verified and book marked sold.");
              if (typeof onSuccess === "function")
                onSuccess(data.updatedBook || null);
            } else {
              console.error("Verify failed:", data);
              alert(data.message || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Network error verifying payment.");
          } finally {
            setLoading(false);
          }
        },
        onError(err) {
          console.error("Khalti widget error:", err);
          const status = err?.status_code || err?.status || null;
          const payload = err?.payload || {};
          // common helpful guidance
          if (status === 400 && Array.isArray(payload.public_key)) {
            alert(
              "Khalti rejected the public key. Ensure REACT_APP_KHALTI_PUBLIC_KEY is the Khalti PUBLIC key (not the secret),\n" +
                "and whitelist your frontend origin (http://localhost:3000) in Khalti dashboard."
            );
            return;
          }
          if (
            status === 401 ||
            /Payment types couldn't load/i.test(err?.message || "")
          ) {
            alert(
              "Khalti failed to load payment types. Verify the public key and whitelist your origin in Khalti dashboard."
            );
            return;
          }
          alert("Payment failed: " + (err?.message || "Unknown error"));
        },
        onClose() {
          // optional analytics / cleanup
        },
      },
    };

    try {
      const checkout = new window.KhaltiCheckout(config);
      checkout.show({ amount: amountPaisa });
    } catch (e) {
      console.error("KhaltiCheckout init error:", e);
      alert("Failed to open Khalti checkout.");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || productSold}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        background: productSold ? "#888" : "#5C2D91",
        color: "#fff",
        border: "none",
        fontWeight: "bold",
        cursor: productSold ? "not-allowed" : "pointer",
      }}
    >
      {productSold ? "Sold" : loading ? "Processing..." : "Pay with Khalti"}
    </button>
  );
}
