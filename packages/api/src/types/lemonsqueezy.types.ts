type LS_SubscriptionEventNames =
  | "subscription_created"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_updated"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_unpaused";

type LS_LS_SubscriptionInvoiceEventNames =
  | "subscription_payment_success"
  | "subscription_payment_failed"
  | "subscription_payment_recovered";

type LS_OrderEventNames = "order_created" | "order_refunded";

type LicenseKeyEventNames = "license_key_created";

export type LS_WebhookPayload<CustomData = any> = {
  data: LS_Subscription | LS_SubscriptionInvoice | LS_Order | LicenseKey;
  meta: {
    event_name:
      | LS_SubscriptionEventNames
      | LS_LS_SubscriptionInvoiceEventNames
      | LS_OrderEventNames
      | LicenseKeyEventNames;
    custom_data?: CustomData;
  };
};

export type EventName = LS_WebhookPayload["meta"]["event_name"];

export type LS_SubscriptionInvoice = {
  type: "subscription-invoices";
  id: string;
  attributes: {
    store_id: number;
    subscription_id: number;
    billing_reason: string;
    card_brand: string;
    card_last_four: string;
    currency: string;
    currency_rate: string;
    subtotal: number;
    discount_total: number;
    tax: number;
    total: number;
    subtotal_usd: number;
    discount_total_usd: number;
    tax_usd: number;
    total_usd: number;
    status: string;
    status_formatted: string;
    refunded: number;
    refunded_at: any;
    subtotal_formatted: string;
    discount_total_formatted: string;
    tax_formatted: string;
    total_formatted: string;
    urls: {
      invoice_url: string;
    };
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
  relationships: {
    store: {
      links: {
        related: string;
        self: string;
      };
    };
    subscription: {
      links: {
        related: string;
        self: string;
      };
    };
  };
  links: {
    self: string;
  };
};

export type LS_Subscription = {
  type: "subscriptions";
  id: string;
  attributes: {
    store_id: number;
    order_id: number;
    customer_id: number;
    order_item_id: number;
    product_id: number;
    variant_id: number;
    product_name: string;
    variant_name: string;
    user_name: string;
    user_email: string;
    status: LS_SubscriptionStatus;
    status_formatted: string;
    pause: any | null;
    cancelled: boolean;
    trial_ends_at: string | null;
    billing_anchor: number;
    urls: {
      update_payment_method: string;
    };
    renews_at: string;
    card_brand: string;
    card_last_four: string;
    /**
     * If the subscription has as status of cancelled or expired, this will be an ISO-8601 formatted date-time string indicating when the subscription expires (or expired). For all other status values, this will be null.
     */
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
};

export type LS_Order = {
  type: "orders";
  id: string;
  attributes: {
    store_id: number;
    identifier: string;
    order_number: number;
    user_name: string;
    user_email: string;
    currency: string;
    currency_rate: string;
    subtotal: number;
    discount_total: number;
    tax: number;
    total: number;
    subtotal_usd: number;
    discount_total_usd: number;
    tax_usd: number;
    total_usd: number;
    tax_name: string;
    tax_rate: string;
    status: string;
    status_formatted: string;
    refunded: number;
    refunded_at: any;
    subtotal_formatted: string;
    discount_total_formatted: string;
    tax_formatted: string;
    total_formatted: string;
    first_order_item: {
      id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      price: number;
      created_at: string;
      updated_at: string;
      test_mode: boolean;
    };
    created_at: string;
    updated_at: string;
  };
};

export type LicenseKey = {
  type: "license-keys";
  id: string;
  attributes: {
    store_id: number;
    order_id: number;
    order_item_id: number;
    product_id: number;
    user_name: string;
    user_email: string;
    key: string;
    key_short: string;
    activation_limit: number;
    instances_count: number;
    disabled: number;
    status: string;
    status_formatted: string;
    expires_at: any;
    created_at: string;
    updated_at: string;
  };
};

type LS_SubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";
