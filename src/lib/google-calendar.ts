import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

export async function getGoogleAuthClient() {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );
    return client;
}

export async function getAuthenticatedClient(userId: string) {
    const supabase = await createClient();
    const { data: config, error } = await supabase
        .from('google_calendar_configs')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !config) {
        throw new Error('Google Calendar non configurato');
    }

    const client = await getGoogleAuthClient();
    client.setCredentials({
        access_token: config.access_token,
        refresh_token: config.refresh_token,
        expiry_date: Number(config.expiry_date),
    });

    // Refresh token if expired
    client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            await supabase
                .from('google_calendar_configs')
                .update({
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expiry_date: tokens.expiry_date,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
        } else {
            await supabase
                .from('google_calendar_configs')
                .update({
                    access_token: tokens.access_token,
                    expiry_date: tokens.expiry_date,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
        }
    });

    return client;
}

export async function createGoogleEvent(userId: string, eventData: any) {
    const auth = await getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const { data: config } = await (await createClient())
        .from('google_calendar_configs')
        .select('calendar_id')
        .eq('user_id', userId)
        .single();

    const calendarId = config?.calendar_id || 'primary';

    const response = await calendar.events.insert({
        calendarId,
        requestBody: {
            summary: eventData.name,
            location: eventData.location,
            description: eventData.notes,
            start: {
                dateTime: new Date(eventData.start_date).toISOString(),
            },
            end: {
                dateTime: new Date(eventData.end_date).toISOString(),
            },
        },
    });

    return response.data;
}

export async function updateGoogleEvent(userId: string, googleEventId: string, eventData: any) {
    const auth = await getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const { data: config } = await (await createClient())
        .from('google_calendar_configs')
        .select('calendar_id')
        .eq('user_id', userId)
        .single();

    const calendarId = config?.calendar_id || 'primary';

    const response = await calendar.events.update({
        calendarId,
        eventId: googleEventId,
        requestBody: {
            summary: eventData.name,
            location: eventData.location,
            description: eventData.notes,
            start: {
                dateTime: new Date(eventData.start_date).toISOString(),
            },
            end: {
                dateTime: new Date(eventData.end_date).toISOString(),
            },
        },
    });

    return response.data;
}

export async function deleteGoogleEvent(userId: string, googleEventId: string) {
    const auth = await getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const { data: config } = await (await createClient())
        .from('google_calendar_configs')
        .select('calendar_id')
        .eq('user_id', userId)
        .single();

    const calendarId = config?.calendar_id || 'primary';

    await calendar.events.delete({
        calendarId,
        eventId: googleEventId,
    });
}
