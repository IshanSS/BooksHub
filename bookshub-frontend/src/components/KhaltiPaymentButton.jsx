// src/components/KhaltiPaymentButton.jsx
import React from "react";

// Official Khalti test public key from docs: https://docs.khalti.com/api/v2/#test-keys
const khaltiConfig = {
  publicKey: "test_public_key_dc74b7b3a9e54b8c8e6e3e7b3e8e3e7b", // Official test key
  productIdentity: "book-001",
  productName: "Book Purchase",
  productUrl: "http://localhost:3000/",
  eventHandler: {
    onSuccess(payload) {
      alert("Payment Successful!\n" + JSON.stringify(payload, null, 2));
    },
    onError(error) {
      alert("Payment Failed!\n" + JSON.stringify(error, null, 2));
    },
    onClose() {
      // Do nothing
    },
  },
  paymentPreference: [
    "KHALTI",
    "EBANKING",
    "MOBILE_BANKING",
    "CONNECT_IPS",
    "SCT",
  ],
};

export default function KhaltiPaymentButton({
  amount,
  productName,
  productId,
}) {
  const handleKhaltiPay = () => {
    // Dynamically load Khalti script if not already loaded
    if (!window.KhaltiCheckout) {
      const script = document.createElement("script");
      script.src = "https://khalti.com/static/khalti-checkout.js";
      script.onload = () => openKhalti();
      document.body.appendChild(script);
    } else {
      openKhalti();
    }
  };

  const openKhalti = () => {
    const config = {
      ...khaltiConfig,
      productIdentity: productId || khaltiConfig.productIdentity,
      productName: productName || khaltiConfig.productName,
    };
    const checkout = new window.KhaltiCheckout(config);
    // Khalti expects amount in paisa (1 rupee = 100 paisa)
    // Make sure 'amount' prop is in rupees, so we multiply by 100 here
    checkout.show({ amount: amount * 100 });
  };

  return (
    <button
      onClick={handleKhaltiPay}
      style={{
        padding: 10,
        borderRadius: 6,
        background: "#5C2D91",
        color: "#fff",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Pay with Khalti
    </button>
  );
}
