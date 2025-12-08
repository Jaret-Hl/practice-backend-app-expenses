import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`No se ha proporcionado la variable de entorno: ${name}`);
  }
  return value;
}

export const ENV = {
  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_ANON_KEY: required("SUPABASE_ANON_KEY"),
  PORT: process.env.PORT || "3000",
};
