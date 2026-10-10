import { supabase } from "../../../../core/db.js";

const CONTACT_SELECT = "*, person:person_id(id, first_name, last_name, email, phone)";

export class EnterpriseContactService {
  static async getAllByEnterprise(enterpriseId: number) {
    return await supabase
      .from("person_enterprise_relationship")
      .select(CONTACT_SELECT)
      .eq("enterprise_id", enterpriseId)
      .eq("relationship_type", "contact");
  }

  static async create(
    enterpriseId: number,
    payload: {
      person_id?: number;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      role_description?: string;
    },
    userId: number,
  ) {
    let personId = payload.person_id;

    if (!personId) {
      // Evita duplicar: si ya existe una persona con ese email, se reutiliza.
      if (payload.email) {
        const { data: existing } = await supabase
          .from("persons")
          .select("id")
          .eq("email", payload.email)
          .maybeSingle();
        if (existing) personId = existing.id;
      }

      if (!personId) {
        const { data: newPerson, error: personError } = await supabase
          .from("persons")
          .insert([
            {
              first_name: payload.first_name,
              last_name: payload.last_name,
              email: payload.email,
              phone: payload.phone,
              created_by_user_id: userId,
            },
          ])
          .select()
          .single();

        if (personError) return { error: personError.message, data: null };
        personId = newPerson.id;
      }
    }

    return await supabase
      .from("person_enterprise_relationship")
      .insert([
        {
          person_id: personId,
          enterprise_id: enterpriseId,
          relationship_type: "contact",
          role_description: payload.role_description,
          created_by_user_id: userId,
        },
      ])
      .select(CONTACT_SELECT);
  }

  static async delete(id: number) {
    return await supabase
      .from("person_enterprise_relationship")
      .delete()
      .eq("id", id)
      .select();
  }
}
