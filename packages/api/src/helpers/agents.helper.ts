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
  if (type === "ANTI_THEFT") {
    const agents = await prisma.agents.findMany({
      where: {
        type: "ANTI_THEFT",
        userId: userId,
        protected_numbers: {
          some: {
            phone: phoneNumber,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return agents.length > 0;
  }

  if (type === "AUTOMATED_CUSTOMER_SUPPORT") {
    const [autoAgent, antiAgent] = await Promise.all([
      prisma.agents.findFirst({
        where: {
          type: "AUTOMATED_CUSTOMER_SUPPORT",
          userId: userId,
          contact_number: phoneNumber,
        },
        select: {
          id: true,
        },
      }),
      prisma.agents.findMany({
        where: {
          type: "ANTI_THEFT",
          protected_numbers: {
            some: {
              phone: phoneNumber,
            },
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    return !!autoAgent || antiAgent.length > 0;
  }

  return false;
};
