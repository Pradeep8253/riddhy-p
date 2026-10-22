"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { clearCart } from "@/store/cartSlice";
import { formatINR } from "@/lib/demo-data";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { validateGSTIN } from "@/config/gstConfig";
import { lookupPincode } from "@/lib/serviceability";
import styles from "./CheckoutClient.module.css";

const initial = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "Prayagraj",
  state: "Uttar Pradesh",
  pincode: "211001",
  landmark: "",
};
function createCheckoutKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `rf-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
export default function CheckoutClient({ initialCoupon = "" }) {
  const router = useRouter(),
    dispatch = useDispatch(),
    items = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const authChecked = useSelector((state) => state.auth?.checked);
  const [address, setAddress] = useState(initial),
    [coupon, setCoupon] = useState(initialCoupon),
    [paymentMethod, setPaymentMethod] = useState("razorpay"),
    [quote, setQuote] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [checkoutKey, setCheckoutKey] = useState("");
  const [needsGst, setNeedsGst] = useState(false),
    [buyerGstin, setBuyerGstin] = useState(""),
    [buyerBusinessName, setBuyerBusinessName] = useState("");
  const [timerSec, setTimerSec] = useState(20 * 60);

  useEffect(() => {
    const interval = setInterval(
      () => setTimerSec((prev) => (prev > 0 ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60),
      s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    if (user) {
      setAddress((current) => ({
        ...current,
        name: current.name || user.name || "",
        email: current.email || user.email || "",
      }));
    }
  }, [user]);
  const skus = useMemo(
    () => items.map((item) => ({ sku: item.sku, qty: item.qty })),
    [items],
  );
  const cartFingerprint = useMemo(() => JSON.stringify(skus), [skus]);
  useEffect(() => {
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("rf-checkout-key-v1") || "null",
      );
      if (stored?.fingerprint === cartFingerprint && stored.key) {
        setCheckoutKey(stored.key);
        return;
      }
      const key = createCheckoutKey();
      sessionStorage.setItem(
        "rf-checkout-key-v1",
        JSON.stringify({ fingerprint: cartFingerprint, key }),
      );
      setCheckoutKey(key);
    } catch {
      setCheckoutKey(createCheckoutKey());
    }
  }, [cartFingerprint]);
  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      return;
    }
    let alive = true;
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: skus,
        pincode: address.pincode,
        coupon: coupon || undefined,
      }),
    })
      .then(async (response) => {
        const json = await response.json();
        if (!alive) return;
        if (json.success) setQuote(json.data);
        else {
          setQuote(null);
          setMessage(json.error?.message || "Unable to quote this cart.");
        }
      })
      .catch(() => {
        if (alive) setMessage("Unable to connect to checkout pricing.");
      });
    return () => {
      alive = false;
    };
  }, [items, skus, address.pincode, coupon]);
  const update = (key, value) =>
    setAddress((current) => ({ ...current, [key]: value }));
  const handlePincodeChange = (e) => {
    const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
    setAddress((curr) => {
      const next = { ...curr, pincode: pin };
      if (pin.length === 6) {
        const match = lookupPincode(pin);
        if (match?.city) next.city = match.city;
        if (match?.state) next.state = match.state;
      }
      return next;
    });
  };
  const clearCheckoutKey = () => {
    try {
      sessionStorage.removeItem("rf-checkout-key-v1");
    } catch {}
  };
  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!items.length) {
      setMessage("Your bag is empty.");
      return;
    }
    if (!quote) {
      setMessage("Please wait for your server-verified quote.");
      return;
    }
    if (!checkoutKey) {
      setMessage("Preparing secure checkout. Please try again.");
      return;
    }
    if (needsGst) {
      if (!buyerBusinessName.trim()) {
        setMessage(
          "Please provide your registered Business Name for the GST invoice.",
        );
        return;
      }
      if (!validateGSTIN(buyerGstin)) {
        setMessage(
          "Please enter a valid 15-character Indian GSTIN with matching checksum.",
        );
        return;
      }
    }
    setBusy(true);
    try {
      const body = {
        items: skus,
        pincode: address.pincode,
        coupon: coupon || undefined,
        email: address.email,
        phone: address.phone,
        address: {
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark,
        },
        buyerGstin: needsGst ? buyerGstin.toUpperCase().trim() : undefined,
        buyerBusinessName: needsGst ? buyerBusinessName.trim() : undefined,
        isB2B: needsGst,
        paymentMethod,
        idempotencyKey: checkoutKey,
      };
      const reservationResponse = await fetch("/api/checkout/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        reservation = await reservationResponse.json();
      if (!reservationResponse.ok || !reservation.success) {
        const errorText =
          reservation.error?.message || "Could not reserve this order.";
        if (
          reservationResponse.status === 409 &&
          (errorText.toLowerCase().includes("reservation has expired") ||
            errorText.toLowerCase().includes("checkout key is associated"))
        ) {
          const key = createCheckoutKey();
          setCheckoutKey(key);
          try {
            sessionStorage.setItem(
              "rf-checkout-key-v1",
              JSON.stringify({ fingerprint: cartFingerprint, key }),
            );
          } catch {}
          setMessage(
            errorText.toLowerCase().includes("reservation has expired")
              ? "Your timed stock reservation expired. Review the refreshed quote, then continue again."
              : "Checkout details changed. We refreshed the secure key; review the order and continue again.",
          );
          return;
        }
        throw new Error(errorText);
      }
      const order = reservation.data;
      if (order.alreadyPaid) {
        dispatch(clearCart());
        clearCheckoutKey();
        router.push(
          `/payment/result?status=verify&orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(address.email)}`,
        );
        return;
      }
      if (order.paymentMethod === "cod") {
        dispatch(clearCart());
        clearCheckoutKey();
        router.push(
          `/payment/result?status=cod&orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(address.email)}`,
        );
        return;
      }
      const paymentResponse = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, email: address.email }),
        }),
        payment = await paymentResponse.json();
      if (!paymentResponse.ok || !payment.success)
        throw new Error(
          payment.error?.message || "Online payment could not be created.",
        );
      const loaded = await loadRazorpay();
      if (!loaded)
        throw new Error(
          "Razorpay Checkout could not load. The 20-minute reservation is released on the next quote or checkout request if payment is not completed.",
        );
      const options = {
        key: payment.data.keyId,
        amount: payment.data.amount,
        currency: payment.data.currency,
        name: "RF Riddhy",
        description: `Order ${payment.data.orderNumber}`,
        order_id: payment.data.razorpayOrderId,
        prefill: payment.data.customer,
        theme: { color: "#2e7d32" },
        modal: {
          ondismiss: () =>
            setMessage(
              "Payment window closed. The order is not marked paid until Razorpay confirms capture.",
            ),
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: payment.data.orderId,
                  ...response,
                }),
              }),
              verify = await verifyResponse.json();
            if (verify.data?.paid) {
              dispatch(clearCart());
              clearCheckoutKey();
              router.push(
                `/payment/result?status=verify&orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(address.email)}`,
              );
            } else
              router.push(
                `/payment/result?status=pending&orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(address.email)}`,
              );
          } catch {
            router.push(
              `/payment/result?status=pending&orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(address.email)}`,
            );
          }
        },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };
  if (authChecked && !isAuthenticated) {
    return (
      <div className={styles.empty}>
        <h2>Sign in to complete your order</h2>
        <p>
          Please sign in to your Riddhy account to review delivery details and
          checkout.
        </p>
        <Button href="/account?redirect=/checkout">
          Sign in to your account
        </Button>
      </div>
    );
  }
  if (!items.length)
    return (
      <div className={styles.empty}>
        <h2>Your bag is empty.</h2>
        <p>Add something you love before checking out.</p>
        <Button href="/furniture">Browse furniture</Button>
      </div>
    );
  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={submit}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "#eef6f0",
            border: "1px solid #cce4d2",
            borderRadius: 8,
            marginBottom: 18,
            fontSize: 13,
            color: "#17632a",
          }}
        >
          <span>
            ⏱️ <strong>Items reserved:</strong> {formatTimer(timerSec)}{" "}
            remaining
          </span>
          <small style={{ color: "#4a7c59" }}>
            Hold is maintained during checkout
          </small>
        </div>
        <div className={styles.stepHead}>
          <span>01</span>
          <div>
            <b>Delivery details</b>
            <small>Where should we bring your order?</small>
          </div>
        </div>
        <div className={styles.fields}>
          <label>
            Full name
            <input
              required
              minLength={2}
              autoComplete="name"
              value={address.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={address.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>
          <label>
            Mobile number
            <input
              required
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              value={address.phone}
              onChange={(event) =>
                update(
                  "phone",
                  event.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
            />
          </label>
          <label>
            Address line 1
            <input
              required
              minLength={5}
              autoComplete="address-line1"
              value={address.line1}
              onChange={(event) => update("line1", event.target.value)}
            />
          </label>
          <label>
            Address line 2 <span>Optional</span>
            <input
              autoComplete="address-line2"
              value={address.line2}
              onChange={(event) => update("line2", event.target.value)}
            />
          </label>
          <label>
            City
            <input
              required
              autoComplete="address-level2"
              value={address.city}
              onChange={(event) => update("city", event.target.value)}
            />
          </label>
          <label>
            State
            <input
              required
              autoComplete="address-level1"
              value={address.state}
              onChange={(event) => update("state", event.target.value)}
            />
          </label>
          <label>
            Pincode
            <input
              required
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              value={address.pincode}
              onChange={handlePincodeChange}
            />
          </label>
          {address.pincode?.length === 6 && (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "8px 12px",
                background: quote?.serviceability?.serviceable
                  ? "#eaf5ec"
                  : "#fff3e0",
                border: `1px solid ${quote?.serviceability?.serviceable ? "#c3e6cb" : "#ffeeba"}`,
                borderRadius: 6,
                fontSize: 12,
                color: quote?.serviceability?.serviceable
                  ? "#155724"
                  : "#856404",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>
                {quote?.serviceability?.serviceable
                  ? "✓ White-glove express delivery & installation available for this area"
                  : "ℹ Standard logistics delivery available for this area"}
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            margin: "14px 0 20px",
            padding: "12px 14px",
            background: "#f8f5ee",
            borderRadius: 8,
            border: "1px solid #e0d9cc",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              color: "#1e2420",
            }}
          >
            <input
              type="checkbox"
              checked={needsGst}
              onChange={(e) => setNeedsGst(e.target.checked)}
            />
            <span>I need a GST invoice for business tax credit (B2B)</span>
          </label>
          {needsGst && (
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Registered Business Name *
                <input
                  required={needsGst}
                  value={buyerBusinessName}
                  onChange={(e) => setBuyerBusinessName(e.target.value)}
                  placeholder="e.g. Acme Studio LLP"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #d5cec2",
                  }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600 }}>
                Buyer GSTIN (15-characters) *
                <input
                  required={needsGst}
                  value={buyerGstin}
                  maxLength={15}
                  onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #d5cec2",
                  }}
                />
              </label>
            </div>
          )}
        </div>
        <div className={styles.stepHead}>
          <span>02</span>
          <div>
            <b>Payment</b>
            <small>Choose a method available for this order.</small>
          </div>
        </div>
        <div className={styles.methods}>
          <label
            className={paymentMethod === "razorpay" ? styles.selected : ""}
          >
            <input
              type="radio"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={() => setPaymentMethod("razorpay")}
            />
            <span>
              <b>Pay online</b>
              <small>UPI, cards, netbanking and more via Razorpay</small>
            </span>
            <Icon name="check" size={17} />
          </label>
          <label
            className={`${paymentMethod === "cod" ? styles.selected : ""} ${!quote?.codAllowed ? styles.disabled : ""}`}
          >
            <input
              type="radio"
              value="cod"
              checked={paymentMethod === "cod"}
              disabled={!quote?.codAllowed}
              onChange={() => setPaymentMethod("cod")}
            />
            <span>
              <b>Cash on delivery</b>
              <small>
                {quote?.codAllowed
                  ? "Available for this pincode and order value."
                  : "Not available for this pincode or order value."}
              </small>
            </span>
            <Icon name="check" size={17} />
          </label>
        </div>
        {message && (
          <div className={styles.message} role="alert">
            {message}
          </div>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={busy || !quote || !checkoutKey}
          className={styles.place}
        >
          {busy
            ? "Preparing secure checkout…"
            : paymentMethod === "cod"
              ? "Place COD order"
              : "Continue to secure payment"}{" "}
          <Icon name="arrow" size={16} />
        </Button>
        <p className={styles.note}>
          The amount is recalculated on the server. A payment redirect alone is
          never treated as proof of payment.
        </p>
      </form>
      <aside className={styles.summary}>
        <span className={styles.kicker}>ORDER SUMMARY</span>
        <h2>Review your order</h2>
        <div className={styles.items}>
          {items.map((item) => (
            <div key={item.sku}>
              <span>
                {item.name} <small>× {item.qty}</small>
              </span>
              <b>{formatINR(item.price * item.qty)}</b>
            </div>
          ))}
        </div>
        <label className={styles.coupon}>
          Coupon code
          <div>
            <input
              value={coupon}
              onChange={(event) => setCoupon(event.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
            />
            <span>{quote?.couponMessage || "Applied at quote"}</span>
          </div>
        </label>
        {quote ? (
          <>
            <div className={styles.row}>
              <span>Items subtotal</span>
              <b>{formatINR(quote.subtotal)}</b>
            </div>
            <div className={styles.row}>
              <span>Tax</span>
              <b>{formatINR(quote.tax)}</b>
            </div>
            <div className={styles.row}>
              <span>Delivery</span>
              <b>{formatINR(quote.deliveryFee)}</b>
            </div>
            <div className={styles.row}>
              <span>Installation</span>
              <b>{formatINR(quote.installationFee)}</b>
            </div>
            {quote.couponDiscount > 0 && (
              <div className={styles.row}>
                <span>Coupon</span>
                <b>−{formatINR(quote.couponDiscount)}</b>
              </div>
            )}
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total</span>
              <b>{formatINR(quote.total)}</b>
            </div>
            <small className={styles.serviceNote}>
              {quote.serviceability?.message ||
                "Enter your pincode for delivery options."}
            </small>
            {quote.demoOnly && (
              <small className={styles.sample}>
                Online checkout is currently in catalogue preview mode. Please
                contact store desk to place your order.
              </small>
            )}
          </>
        ) : (
          <div className={styles.loading}>Calculating live quote…</div>
        )}
      </aside>
    </div>
  );
}
