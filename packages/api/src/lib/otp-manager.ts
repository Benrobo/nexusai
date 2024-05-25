import redis from "config/redis";

export default class OTPManager {
  constructor() {}

  public generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  // send otp to phone number
  public async sendOTPToPhone(phone: string, userId: string) {
    try {
      if (!phone || phone.length === 0) {
        console.log(`Invalid phone number: ${phone}`);
        return false;
      }

      //1. store OTP in redis for 5 mins
      const otp = this.generateOTP();
      const ttl = 5 * 60 * 1000; // 5 mins
      await redis.set(
        userId,
        JSON.stringify({
          otp,
          phone,
        })
      );
      await redis.expire(userId, ttl);

      //2. send OTP to phone number
      // IMPLEMENT TWILLIO FOR SENDING SMS

      //3. return success response
      return true;
    } catch (e: any) {
      console.log(e);
      console.log(`Error in sending OTP to phone number: ${e.message}`);
      return false;
    }
  }
}
