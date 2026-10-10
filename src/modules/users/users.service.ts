import { applySearchFilter } from "../../shared/filters/search.js";
import { supabase } from "../../core/db.js";

const USER_WITH_PERSON_SELECT =
  "*, person:person_id(id, first_name, last_name, email, phone)";

export class UserService {
  static async getAll({
    is_active,
    search,
    userId,
    limit,
    offset,
  }: {
    is_active?: boolean;
    search?: string;
    userId?: number;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from("users")
      .select(USER_WITH_PERSON_SELECT, { count: "exact" });

    if (is_active !== undefined) {
      query = query.eq("is_active", is_active === true);
    }

    if (search) {
      try {
        query = applySearchFilter(query, search, ["name"]);
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const term = typeof search === "string" ? search.trim() : "";
    if (term.length >= 3) {
      const like = `%${term}%`;
      query = query.or(`name.ilike.${like}`);
    } else if (term.length > 0) {
      return { error: "El término de búsqueda debe tener al menos 3 caracteres" };
    }

    if (limit && offset !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;
    return { data, error, count };
  }

  static async getById(id: number) {
    return await supabase
      .from("users")
      .select(USER_WITH_PERSON_SELECT)
      .eq("id", id)
      .single();
  }

  static async create(payload: any) {
    return await supabase.from("users").insert([payload]).select();
  }

  static async update(id: number, payload: any) {
    return await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .select();
  }

  static async delete(id: number) {
    return await supabase.from("users").delete().eq("id", id).select();
  }

  /**
   * Vincula un usuario existente con una persona (Etapa 3 de la migración:
   * users.person_id). Úsalo también en el flujo de alta de usuario nuevo,
   * una vez que primero se creó/encontró la persona correspondiente.
   */
  static async linkPerson(userId: number, personId: number) {
    return await supabase
      .from("users")
      .update({ person_id: personId })
      .eq("id", userId)
      .select(USER_WITH_PERSON_SELECT);
  }
}
