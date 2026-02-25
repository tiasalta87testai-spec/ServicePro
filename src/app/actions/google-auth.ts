"use server"

import { getGoogleAuthClient } from "@/lib/google-calendar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getGoogleAuthUrl() {
    const client = await getGoogleAuthClient();
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly'
        ],
        prompt: 'consent'
    });
    return url;
}

export async function disconnectGoogleCalendar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Non autorizzato' };

    const { error } = await supabase
        .from('google_calendar_configs')
        .delete()
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    return { success: true };
}
