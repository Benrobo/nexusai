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
}
