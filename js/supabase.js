const SUPABASE_URL = "https://rcgxjkrflcucllqqxiaf.supabase.co";
const SUPABASE_KEY = "sb_publishable_k_f0XnOKeoQEA_6RFr7G6Q_srAF07En";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase Connected");