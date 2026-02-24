import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
    const { name } = await req.json()
    const data = {
        message: `Hello ${name}! This is a placeholder for send-email edge function.`,
    }

    return new Response(
        JSON.stringify(data),
        { headers: { "Content-Type": "application/json" } },
    )
})
