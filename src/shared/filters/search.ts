export function applySearchFilter(query: any, term: string, fields: string[]) {
  if (!term) return query;

  const trimmed = term.trim();
  if (trimmed.length < 3) {
    throw new Error("El término de búsqueda debe tener al menos 3 caracteres");
  }

  const like = `%${trimmed}%`;

  const conditions = fields
    .map(f => `${f}.ilike.${like}`)
    .join(",");

  return query.or(conditions);
}
