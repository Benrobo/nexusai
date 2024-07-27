import prisma from "../prisma/prisma.js";

export default class IntegrationService {
  constructor() {}

  public async getIntegrationByAgentId(agent_id: string) {
    const integrations = await prisma.integration.findMany({
      where: {
        agent_id: agent_id,
      },
      include: {
        agents: {
          select: {
            integrations: true,
          },
        },
      },
    });

    return integrations;
  }
}
