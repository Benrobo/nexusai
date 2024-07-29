import redis from "../config/redis.js";
import HttpException from "./exception.js";
import { RESPONSE_CODE } from "../types/index.js";
import { sendSMS } from "../helpers/twilio.helper.js";

interface IStoredOTP {
  otp: number;
  phone: string;
}

export default class OTPManager {
  constructor() {}

  public generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  // send otp to phone number
  public async sendOTP(
    phone: string,
    userId: string,
    userPurchasedNumber?: string | null | undefined
  ) {
    if (!phone || phone.length === 0) {
      console.log(`Invalid phone number: ${phone}`);
      return false;
    }

    const otp = this.generateOTP();
    const ttl = 60 * 5; // 5 mins
    await redis.set(
      userId,
      JSON.stringify({
        otp,
        phone,
      })
    );
    await redis.expire(userId, ttl);

    console.log(`\nOTP sent to phone: ${phone} is ${otp}\n`);

    const message = `Your Nexus verification code is ${otp}.`;
    await sendSMS(userPurchasedNumber, phone, message);

    return true;
  }

  public async verifyOTP(userId: string, otpCode: string) {
    const otp = JSON.parse(await redis.get(userId)) as IStoredOTP;
    if (!otp) {
      throw new HttpException(RESPONSE_CODE.INVALID_OTP, "Invalid OTP", 400);
    }

    if (Number(otp.otp) !== Number(otpCode)) {
      throw new HttpException(
        RESPONSE_CODE.INVALID_OTP,
        "Invalid OTP Code",
        400
      );
    }

    return otp;
  }
}
