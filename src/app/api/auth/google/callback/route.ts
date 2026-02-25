import { getGoogleAuthClient } from "@/lib/google-calendar";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${error}`);
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`);
    }

    try {
        const client = await getGoogleAuthClient();
        const { tokens } = await client.getToken(code);

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Non autorizzato');

        const { data: userData } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

        if (!userData) throw new Error('Tenant non trovato');

        const { error: upsertError } = await supabase
            .from('google_calendar_configs')
            .upsert({
                tenant_id: userData.tenant_id,
                user_id: user.id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: tokens.expiry_date,
                calendar_id: 'primary',
                is_active: true,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'tenant_id,user_id'
            });

        if (upsertError) throw upsertError;

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=google_connected`);
    } catch (err: any) {
        console.error('Google Auth Error:', err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=auth_failed`);
    }
}
