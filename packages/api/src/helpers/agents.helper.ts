import prisma from "../prisma/prisma";
import type { AgentType } from "@nexusai/shared/types";

interface CheckPhoneNumInUse {
  phoneNumber: string;
  type: AgentType;
  userId: string;
}

export const checkAgentPhoneNumInUse = async ({
  phoneNumber,
  type,
  userId,
}: CheckPhoneNumInUse) => {
  let isPhoneNumberInUse = false;
  if (type === "ANTI_THEFT") {
    const agents = await prisma.agents.findMany({
      where: {
        type: type,
        userId: userId,
      },
      select: {
        protected_numbers: true,
      },
    });

    if (agents.length > 0) {
      agents.forEach((agent) => {
        agent.protected_numbers?.forEach((protectedNumber) => {
          if (protectedNumber.phone === phoneNumber) {
            isPhoneNumberInUse = true;
          }
        });
      });
    }
    return isPhoneNumberInUse;
  }
  if (type === "AUTOMATED_CUSTOMER_SUPPORT") {
    const agents = await prisma.agents.findMany({
      where: {
        AND: {
          contact_number: phoneNumber,
          userId: userId,
          type: type,
        },
      },
    });

    if (agents.length > 0) {
      isPhoneNumberInUse = true;
    }

    return isPhoneNumberInUse;
  }

  return isPhoneNumberInUse;
};
