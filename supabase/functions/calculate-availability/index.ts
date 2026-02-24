import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
    const data = {
        message: `This is a placeholder for calculate-availability edge function. It will contain the overbooking logic.`,
    }

    return new Response(
        JSON.stringify(data),
        { headers: { "Content-Type": "application/json" } },
    )
})
