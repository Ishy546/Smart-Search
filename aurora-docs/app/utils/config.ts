import { OpenAI } from "openai"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

export const supabaseClient: SupabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
)

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
    // idk why it says dangerouslyAllowBrowser: true?
})