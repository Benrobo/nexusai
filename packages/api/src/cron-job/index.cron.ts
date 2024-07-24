import redis from "../config/redis.js";
import { storage } from "../config/firebase.js";
import dayjs from "dayjs";
import prisma from "../prisma/prisma.js";
import LemonsqueezyServices from "../services/LS.service.js";
import { TwilioService } from "../services/twilio.service.js";

/**
 * Delete old files and cached data from Firebase Storage and Redis.
 */
export async function deleteOldFilesAndCachedData() {
  try {
    const days = 1;
    const bucket = storage.bucket();
    const files = await bucket.getFiles();
    const oldFiles = files[0].filter((file) => {
      const fileDate = dayjs(file.metadata.timeCreated);
      const today = dayjs();
      const diff = today.diff(fileDate, "minute");
      return diff > days;
    });

    const deleteFiles = oldFiles.map(async (file) => {
      const fileId = file.id;
      const [name, hash] = fileId.split("-");
      const newHash = hash.split(".")[0];
      const cacheKey = `${name}:${newHash}`;
      const existsInRedis = await redis.get(cacheKey);

      if (!existsInRedis) {
        console.log("Deleting file from cache..");
        await file.delete();
        await redis.del(cacheKey);
      } else {
        console.log("File not found in cache, proceed to delete..");
        await file.delete();
      }

      return;
    });

    await Promise.all(deleteFiles);
  } catch (e: any) {
    console.log(` Error deleting old files: ${e}`);
  }
}

/**
 * Delete expired phone numbers from the database, those where the grace_period has expired.
 */
export async function deleteExpiredSubscriptionGracePeriods() {
  const now = new Date();
  const twilioService = new TwilioService();
  const subscriptions = await prisma.subscriptions.findMany({
    where: {
      grace_period: {
        lt: now,
      },
    },
  });

  if (subscriptions.length === 0) {
    console.log("No expired subscriptions found.");
    return;
  }

  const deleteSubscriptions = subscriptions.map(async (subscription) => {
    await prisma.subscriptions.update({
      where: {
        id: subscription.id,
      },
      data: {
        is_deleted: true,
      },
    });

    const purchasedPhone = await prisma.purchasedPhoneNumbers.findFirst({
      where: {
        userId: subscription.uId,
      },
    });

    if (!purchasedPhone) {
      console.log("No phone number found for subscription.");
      return;
    }

    await twilioService.releasePhoneNumber(purchasedPhone.phone_number_sid);
  });

  await Promise.all(deleteSubscriptions);
}
