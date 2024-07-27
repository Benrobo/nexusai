import TwilioSubPlanInfo from "../data/twilio/sub-plan.js";
import env from "../config/env.js";
import axios from "axios";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE } from "../types/index.js";

const IN_TEST_MODE = process.env.SERVER_ENV === "development";

export default class LemonsqueezyServices {
  constructor() {}

  // create twilio subscription checkout
  public static async createTwSubCheckout(custom_data?: object) {
    const custom_redirect_url = `${env.CLIENT_URL}/dashboard`;

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            enabled_variants: [],
            redirect_url: custom_redirect_url,
          },
          checkout_options: {},
          checkout_data: {
            //   discount_code: "10PERCENTOFF",
            variant_quantities: [],
            custom: custom_data ?? {},
          },
          preview: true,
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: env.LS.STORE_ID,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: IN_TEST_MODE
                ? String(TwilioSubPlanInfo.local.variant.test_id)
                : String(TwilioSubPlanInfo.local.variant.prod_id),
            },
          },
        },
      },
    };
    let response: {
      data: { url: null | string } | null;
    } = { data: { url: null } };
    try {
      const url = `https://api.lemonsqueezy.com/v1/checkouts`;
      const res = await axios.post(url, payload, {
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${env.LS.API_KEY}`,
        },
      });
      const resp = res.data;

      const checkoutUrl = resp?.data?.attributes?.url;
      response.data = { url: checkoutUrl } as any;
      return response;
    } catch (err: any) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_CREATING_CHECKOUT,
        err?.response?.data?.errors?.[0]?.detail ??
          err.message ??
          "Error creating checkout",
        500
      );
    }
  }

  async getCustomerPortalUrl(customer_id: string) {
    const api = `https://api.lemonsqueezy.com/v1/customers/${customer_id}`;
    const res = await axios.get(api, {
      headers: {
        Authorization: `Bearer ${env.LS.API_KEY}`,
      },
    });

    const data = res.data;

    if (data?.data) {
      const url = data?.data?.attributes?.urls?.customer_portal;
      return url;
    }
    return null;
  }

  async cancelSubscription(sub_id: string) {
    const api = `https://api.lemonsqueezy.com/v1/subscriptions/${sub_id}`;
    const res = await axios.delete(api, {
      headers: {
        Authorization: `Bearer ${env.LS.API_KEY}`,
      },
    });

    const data = res.data;

    if (data?.data) {
      return data;
    }
    return null;
  }

  async getStoreInfo() {
    const api = `https://api.lemonsqueezy.com/v1/stores`;
    try {
      const res = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${env.LS.API_KEY}`,
        },
      });

      const data = res.data;

      if (data?.data) {
        const stores = data?.data;
        const _stores = stores.map((s: any) => {
          return {
            id: s.id,
            name: s.attributes.name,
          };
        });
        return _stores;
      }
      return [];
    } catch (e: any) {
      console.log("Error fetching store info");
      console.log(e?.response?.data);
    }
  }
}
