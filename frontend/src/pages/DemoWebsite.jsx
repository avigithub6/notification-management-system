
import { useState } from "react";
import {
  ShoppingBag,
  UserRound,
  Mail,
  MessageCircle,
  Bell,
  Package,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  createDemoOrder,
  completeDemoPayment,
} from "../services/api";
import "./DemoWebsite.css";

const initialForm = {
  customer_name: "",
  email: "",
  whatsapp: "",
  web_push_subscription_id: "",
  product_name: "Demo Product",
  amount: "499.00",
};

const channelNames = {
  email: "Email",
  whatsapp: "WhatsApp",
  web_push: "Web Push",
};

const channelIcons = {
  email: Mail,
  whatsapp: MessageCircle,
  web_push: Bell,
};

const statusLabels = {
  sent: "Accepted by provider",
  failed: "Failed",
  pending: "Pending",
};

function DemoWebsite() {
  const [form, setForm] = useState(initialForm);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    try {
      setLoading("order");

      const data = await createDemoOrder({
        customer_name: form.customer_name.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        web_push_subscription_id:
          form.web_push_subscription_id.trim(),
        product_name: form.product_name.trim(),
        amount: form.amount,
      });

      setOrder(data.order);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          "Unable to create demo order."
      );
    } finally {
      setLoading("");
    }
  };

  const handleCompletePayment = async () => {
    if (!order?.id) {
      setError("Create an order first.");
      return;
    }

    setError("");
    setResult(null);

    try {
      setLoading("payment");

      const data = await completeDemoPayment(order.id);

      setOrder(data.order);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete demo payment."
      );
    } finally {
      setLoading("");
    }
  };

  const handleNewOrder = () => {
    setOrder(null);
    setResult(null);
    setError("");
  };

  const isPaid = order?.payment_status === "completed";

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <div>
          <div className="demo-eyebrow">
            <ShoppingBag size={14} />
            EVENT TESTING ENVIRONMENT
          </div>
          <h1>Demo Store</h1>
          <p>
            Create an order and simulate payment to test your
            automatic notification workflows.
          </p>
        </div>

        <div className="demo-header-badge">
          <span className="demo-live-dot" />
          Demo environment
        </div>
      </div>

      <div className="demo-steps">
        <div className={`demo-step ${order ? "is-complete" : "is-active"}`}>
          <span className="demo-step-number">
            {order ? <CheckCircle2 size={17} /> : "01"}
          </span>
          <div>
            <strong>Create order</strong>
            <small>Order Created event</small>
          </div>
        </div>

        <div className="demo-step-line" />

        <div className={`demo-step ${isPaid ? "is-complete" : order ? "is-active" : ""}`}>
          <span className="demo-step-number">
            {isPaid ? <CheckCircle2 size={17} /> : "02"}
          </span>
          <div>
            <strong>Complete payment</strong>
            <small>Payment Completed event</small>
          </div>
        </div>

        <div className="demo-step-line" />

        <div className={`demo-step ${result ? "is-active" : ""}`}>
          <span className="demo-step-number">03</span>
          <div>
            <strong>Review results</strong>
            <small>Notification logs</small>
          </div>
        </div>
      </div>

      <div className="demo-layout">
        <main className="demo-main">
          {!order ? (
            <form className="demo-panel" onSubmit={handleCreateOrder}>
              <div className="demo-panel-heading">
                <div className="demo-panel-icon">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2>Create a demo order</h2>
                  <p>Enter the customer and product details below.</p>
                </div>
              </div>

              <div className="demo-section-title">
                <UserRound size={16} />
                Customer information
              </div>

              <div className="demo-form-grid">
                <label className="demo-field">
                  <span>Customer name <b>*</b></span>
                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="demo-field">
                  <span>Email address <b>*</b></span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="demo-field">
                  <span>WhatsApp number <em>Optional</em></span>
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="919876543210"
                    autoComplete="tel"
                  />
                  <small>Include the country code without +.</small>
                </label>

                <label className="demo-field">
                  <span>Web Push subscription ID <em>Optional</em></span>
                  <input
                    name="web_push_subscription_id"
                    value={form.web_push_subscription_id}
                    onChange={handleChange}
                    placeholder="OneSignal subscription ID"
                  />
                  <small>Use the subscription ID, not the App ID.</small>
                </label>
              </div>

              <div className="demo-section-title demo-section-divider">
                <Package size={16} />
                Product details
              </div>

              <div className="demo-form-grid">
                <label className="demo-field">
                  <span>Product name <b>*</b></span>
                  <input
                    name="product_name"
                    value={form.product_name}
                    onChange={handleChange}
                    placeholder="Product name"
                    required
                  />
                </label>

                <label className="demo-field">
                  <span>Amount (INR) <b>*</b></span>
                  <div className="demo-input-prefix">
                    <span>₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="demo-form-footer">
                <div className="demo-footer-note">
                  <ShieldCheck size={17} />
                  This is a test order. No real payment is charged.
                </div>

                <button
                  className="demo-primary-button"
                  type="submit"
                  disabled={Boolean(loading)}
                >
                  {loading === "order" ? "Creating order..." : "Create demo order"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </div>
            </form>
          ) : (
            <div className="demo-panel">
              <div className="demo-panel-heading">
                <div className="demo-panel-icon">
                  <Package size={20} />
                </div>
                <div>
                  <h2>Order #{order.id}</h2>
                  <p>Your demo order has been saved successfully.</p>
                </div>
                <span className={`demo-payment-badge ${isPaid ? "paid" : "pending"}`}>
                  {isPaid ? "Paid" : "Payment pending"}
                </span>
              </div>

              <div className="demo-order-details">
                <div>
                  <span>Customer</span>
                  <strong>{order.customer_name}</strong>
                </div>
                <div>
                  <span>Product</span>
                  <strong>{order.product_name}</strong>
                </div>
                <div>
                  <span>Order number</span>
                  <strong>#{order.id}</strong>
                </div>
                <div>
                  <span>Payment status</span>
                  <strong className={isPaid ? "demo-text-success" : "demo-text-warning"}>
                    {isPaid ? "Completed" : "Pending"}
                  </strong>
                </div>
              </div>

              <div className="demo-order-total">
                <span>Total amount</span>
                <strong>₹{order.amount}</strong>
              </div>

              {!isPaid ? (
                <div className="demo-payment-box">
                  <div className="demo-payment-box-icon">
                    <CreditCard size={21} />
                  </div>
                  <div>
                    <h3>Ready to complete payment?</h3>
                    <p>
                      This simulates a successful payment and automatically
                      fires the Payment Completed event.
                    </p>
                  </div>
                  <button
                    className="demo-primary-button"
                    type="button"
                    onClick={handleCompletePayment}
                    disabled={Boolean(loading)}
                  >
                    {loading === "payment" ? "Processing..." : "Complete demo payment"}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </div>
              ) : (
                <div className="demo-success-box">
                  <CheckCircle2 size={21} />
                  <div>
                    <strong>Demo payment completed</strong>
                    <p>The Payment Completed event has been triggered.</p>
                  </div>
                </div>
              )}

              <button
                className="demo-outline-button"
                type="button"
                onClick={handleNewOrder}
                disabled={Boolean(loading)}
              >
                <RotateCcw size={15} />
                Create another order
              </button>
            </div>
          )}

          {error && (
            <div className="demo-error-box" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <section className="demo-panel demo-results">
              <div className="demo-panel-heading">
                <div className="demo-panel-icon">
                  <Zap size={20} />
                </div>
                <div>
                  <h2>Notification status</h2>
                  <p>
                    Event:{" "}
                    <strong>
                      {result.order?.payment_status === "completed"
                        ? "Payment Completed"
                        : "Order Created"}
                    </strong>
                  </p>
                </div>
                <span className="demo-result-count">
                  {result.notifications?.length || 0} results
                </span>
              </div>

              {result.notification_error && (
                <div className="demo-error-box" role="alert">
                  <AlertCircle size={18} />
                  <span>{result.notification_error}</span>
                </div>
              )}

              {result.notifications?.length > 0 ? (
                <div className="demo-notification-list">
                  {result.notifications.map((notification) => {
                    const Icon = channelIcons[notification.channel] || Bell;
                    const status = notification.status || "pending";

                    return (
                      <div className="demo-notification-card" key={notification.id}>
                        <div className="demo-notification-icon">
                          <Icon size={19} />
                        </div>

                        <div className="demo-notification-info">
                          <div className="demo-notification-top">
                            <strong>
                              {channelNames[notification.channel] ||
                                notification.channel}
                            </strong>
                            <span className={`demo-status-pill ${status}`}>
                              {statusLabels[status] || status}
                            </span>
                          </div>

                          <p>
                            Recipient: <span>{notification.recipient}</span>
                          </p>

                          {status === "failed" && (
                            <div className="demo-notification-error">
                              {notification.error_message ||
                                "The notification provider rejected this request. Check the Notifications page for details."}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="demo-no-results">
                  No notification logs returned for this event.
                </div>
              )}
            </section>
          )}
        </main>

        <aside className="demo-sidebar">
          <div className="demo-summary-card">
            <div className="demo-summary-heading">
              <ShoppingBag size={18} />
              <h3>Order summary</h3>
            </div>

            <div className="demo-product-row">
              <div className="demo-product-image">
                <Package size={28} />
              </div>
              <div>
                <strong>{order?.product_name || form.product_name || "Demo Product"}</strong>
                <span>Demo store item</span>
              </div>
            </div>

            <div className="demo-summary-line">
              <span>Subtotal</span>
              <strong>₹{order?.amount || form.amount || "0.00"}</strong>
            </div>
            <div className="demo-summary-line">
              <span>Additional charges</span>
              <strong>₹0.00</strong>
            </div>
            <div className="demo-summary-total">
              <span>Total</span>
              <strong>₹{order?.amount || form.amount || "0.00"}</strong>
            </div>
          </div>

          <div className="demo-info-card">
            <div className="demo-info-icon">
              <Bell size={18} />
            </div>
            <h3>Automatic notifications</h3>
            <p>
              Creating an order and completing its payment trigger
              your configured notification templates.
            </p>

            <div className="demo-channel-list">
              <span><Mail size={15} /> Email</span>
              <span><MessageCircle size={15} /> WhatsApp</span>
              <span><Bell size={15} /> Web Push</span>
            </div>

            <div className="demo-info-note">
              Provider acceptance does not guarantee final delivery.
            </div>
          </div>
        </aside>
      </div>

      <p className="demo-disclaimer">
        Demo only. Orders are saved in the database, but completing
        a demo payment does not charge real money.
      </p>
    </div>
  );
}

export default DemoWebsite;
