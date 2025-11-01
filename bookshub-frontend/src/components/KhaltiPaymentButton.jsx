import React from "react";

// Use explicit public key (env or the live public key you provided)
// Make this deterministic to avoid passing an invalid/placeholder key to Khalti widget.
const PUBLIC_KEY =
  process.env.REACT_APP_KHALTI_PUBLIC_KEY || "0b469294440f404cbfba952d25af1be8";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

// small helper: treat keys containing "replace" or obviously short values as invalid placeholders
const isValidKey = (k) =>
  typeof k === "string" &&
  k.length >= 20 && // crude length check
  !/replace/i.test(k) && // not a placeholder
  /^[0-9a-zA-Z]+$/.test(k); // only alnum

if (!isValidKey(PUBLIC_KEY)) {
  // eslint-disable-next-line no-console
  console.warn(
    "Khalti public key is missing or looks invalid. Set REACT_APP_KHALTI_PUBLIC_KEY to your Khalti public key and restart the frontend."
  );
} else {
  // eslint-disable-next-line no-console
  console.info("KhaltiPaymentButton using public key:", PUBLIC_KEY);
}

// Determine effective paymentPreference: remove 'KHALTI' if wallet cannot be used
const defaultPaymentPreference = [
  // removed 'KHALTI' to avoid WALLET_PAYMENT_INITIATE errors when wallet isn't enabled/whitelisted
  "EBANKING",
  "MOBILE_BANKING",
  "CONNECT_IPS",
  "SCT",
];

// If PUBLIC_KEY looks invalid/placeholder, disable wallet to avoid WALLET_PAYMENT_INITIATE 400
const canUseWallet = isValidKey(PUBLIC_KEY);

if (!canUseWallet) {
  // eslint-disable-next-line no-console
  console.warn(
    "Khalti wallet (KHALTI) disabled: invalid or missing public key. Widget will fall back to other methods (ebanking/mobile)."
  );
}

const baseConfig = {
  publicKey: PUBLIC_KEY,
  productIdentity: "book-001",
  productName: "Book Purchase",
  productUrl: window.location.origin,
  paymentPreference: defaultPaymentPreference, // no wallet by default
};

export default function KhaltiPaymentButton({
  amount = 100,
  productName,
  productId,
  onSuccess,
}) {
  const handleKhaltiPay = () => {
    if (!window.KhaltiCheckout) {
      const script = document.createElement("script");
      script.src = "https://khalti.com/static/khalti-checkout.js";
      script.onload = openKhalti;
      document.body.appendChild(script);
    } else {
      openKhalti();
    }
  };

  const openKhalti = () => {
    const amountPaisa = Math.round(Number(amount) * 100); // amount in paisa
    const config = {
      ...baseConfig,
      publicKey: PUBLIC_KEY,
      productIdentity: productId || baseConfig.productIdentity,
      productName: productName || baseConfig.productName,
      eventHandler: {
        async onSuccess(payload) {
          // payload.amount is in paisa (integer)
          try {
            const resp = await fetch(`${API_URL}/api/payment/khalti/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: payload.token,
                amount: payload.amount,
                productId: productId || baseConfig.productIdentity,
              }),
            });
            const data = await resp.json();
            if (resp.ok && data.success) {
              // call parent with verification response (include server returned data)
              if (typeof onSuccess === "function")
                onSuccess(data.data, data.updatedBook);
              else alert("Payment verified successfully.");
            } else {
              console.error("Khalti verification failed", data);
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verify error", err);
            alert("Network error verifying payment.");
          }
        },

        onError(err) {
          // Improved handling for wallet-init 400 and public_key validation errors
          console.error("Khalti error (raw):", err);
          const status = err?.status_code || err?.status || null;
          const action = err?.action || null;
          const payload = err?.payload || {};

          // If Khalti responds that the public_key is invalid, show clear guidance and do NOT retry wallet
          if (
            status === 400 &&
            action === "WALLET_PAYMENT_INITIATE" &&
            payload.error_key === "validation_error" &&
            Array.isArray(payload.public_key)
          ) {
            console.error(
              "Khalti validation error details:",
              payload.public_key
            );
            alert(
              "Khalti wallet initiation failed due to invalid public key.\n\n" +
                "Likely causes:\n" +
                "- The public key used is not a valid Khalti public key (check REACT_APP_KHALTI_PUBLIC_KEY).\n" +
                "- You're using a secret key by mistake instead of the public key.\n" +
                "- Your key/domain is not configured in Khalti dashboard (whitelist http://localhost:3000 for local testing).\n\n" +
                "Fix: set a valid Khalti public key in frontend .env, or whitelist your origin in Khalti dashboard. Do NOT put your secret key in the frontend."
            );
            return;
          }

          // If wallet initiation returned 400 but not a public_key validation, attempt a single fallback (non-wallet) only if wallet was enabled
          if (status === 400 && action === "WALLET_PAYMENT_INITIATE") {
            console.warn(
              "Khalti wallet initiation failed. Attempting one fallback to non-wallet methods."
            );
            try {
              const fallbackPrefs = (config.paymentPreference || []).filter(
                (p) => p !== "KHALTI"
              );
              if (fallbackPrefs.length === 0) {
                alert(
                  "Payment initiation failed and no fallback methods available. Check Khalti configuration."
                );
                return;
              }
              const fallbackConfig = {
                ...config,
                paymentPreference: fallbackPrefs,
                eventHandler: {
                  async onSuccess(payload) {
                    // reuse verify flow
                    try {
                      const resp = await fetch(
                        `${API_URL}/api/payment/khalti/verify`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            token: payload.token,
                            amount: payload.amount,
                            productId: productId || baseConfig.productIdentity,
                          }),
                        }
                      );
                      const data = await resp.json();
                      if (resp.ok && data.success) {
                        if (typeof onSuccess === "function")
                          onSuccess(data.data, data.updatedBook);
                        else alert("Payment verified successfully.");
                      } else {
                        console.error("Khalti verification failed", data);
                        alert(
                          "Payment verification failed. Please contact support."
                        );
                      }
                    } catch (errVerify) {
                      console.error("Verify error", errVerify);
                      alert("Network error verifying payment.");
                    }
                  },
                  onError(fErr) {
                    console.error("Khalti fallback error:", fErr);
                    alert(
                      "Payment failed: " + (fErr?.message || "Unknown error")
                    );
                  },
                  onClose() {},
                },
              };

              const fallbackCheckout = new window.KhaltiCheckout(
                fallbackConfig
              );
              fallbackCheckout.show({ amount: amountPaisa });
              alert(
                "Wallet initiation failed. Retrying payment with alternative methods (ebanking/mobile). If this continues, check Khalti key and domain whitelist in your Khalti dashboard."
              );
            } catch (fallbackErr) {
              console.error("Fallback checkout failed:", fallbackErr);
              alert(
                "Payment initiation failed and fallback could not be started. Check console for details and verify your Khalti configuration."
              );
            }
            return;
          }

          // generic fallback for other errors
          alert("Payment failed: " + (err?.message || "Unknown error"));
        },

        onClose() {
          // optional analytics / cleanup
        },
      },
    };

    // show checkout
    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: amountPaisa });
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
