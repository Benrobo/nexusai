import prisma from "../prisma/prisma.js";

interface AddKbData {
  id: string;
  kb_id: string;
  user_id: string;
  title: string;
  type: string;
  embedding: number[];
  content: string;
  created_at: Date;
  updated_at: Date;
}

interface UpdateKbData {
  id: string;
  kb_id: string;
  user_id: string;
  title: string;
  embedding: number[];
  content: string;
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
      kb_id,
      content,
    } = props;
    await prisma.$executeRaw`
          INSERT INTO public."knowledge_base_data" (id,"kb_id","user_id", "type", title, embedding,content, created_at, updated_at) 
          VALUES (
            ${id},
            ${kb_id},
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

  public static async updateKnowledgeBaseData(props: UpdateKbData) {
    const { id, user_id, title, embedding, content, updated_at, kb_id } = props;
    await prisma.$executeRaw`
          UPDATE public."knowledge_base_data" 
          SET 
            title = ${title},
            embedding = ${embedding}::numeric[],
            content = ${content},
            updated_at = ${updated_at}
          WHERE id = ${id} AND "user_id" = ${user_id} AND "kb_id" = ${kb_id}
        `;
  }
}
