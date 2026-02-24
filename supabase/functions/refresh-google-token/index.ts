import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
    const data = {
        message: `This is a placeholder for refresh google token edge function.`,
    }

    return new Response(
        JSON.stringify(data),
        { headers: { "Content-Type": "application/json" } },
    )
})
