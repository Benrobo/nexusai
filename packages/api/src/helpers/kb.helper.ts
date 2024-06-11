import prisma from "../prisma/prisma.js";

interface AddKbData {
  id: string;
  user_id: string;
  title: string;
  type: string;
  embedding: number[];
  content: string;
  created_at: Date;
  updated_at: Date;
}

export default class KbHelper {
  public static async addKnowledgeBaseData(props: AddKbData) {
    const {
      id,
      user_id,
      title,
      type,
      embedding,
      created_at,
      updated_at,
      content,
    } = props;
    await prisma.$executeRaw`
          INSERT INTO public."knowledge_base_data" (id,"user_id", "type", title, embedding,content, created_at, updated_at) 
          VALUES (
            ${id},
            ${user_id},
            ${type}::"KnowledgeBaseType",
            ${title},
            ${embedding}::numeric[],
            ${content},
            ${created_at},
            ${updated_at}
          )
        `;
  }
}
