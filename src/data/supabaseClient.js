import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    "Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. La app no va a poder leer ni guardar datos."
  );
}

export const supabase = createClient(url, key);

export const CV_BUCKET = "cv-candidatos";
