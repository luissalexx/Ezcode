const { response, request } = require('express');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID, CLIENT_HOST, CALENDAR_REFRESH_TOKEN } = process.env;

const oauth2Client = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_SECRET_ID,
    redirectUri: CLIENT_HOST,
});

oauth2Client.setCredentials({
    refresh_token: CALENDAR_REFRESH_TOKEN,
});

const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
});

const createEvent = async (req = request, res = response) => {
    try {
        // Obtener el token de acceso
        const { token } = await oauth2Client.getAccessToken();

        // Utilizar el token de acceso para autenticar la llamada a la API de Calendar
        oauth2Client.setCredentials({ access_token: token });

        const { fecha, alumnoCorreo, profesorCorreo, nombreCurso } = req.body;
        const endTime = new Date(new Date(fecha).getTime() + 60 * 60 * 1000);

        const event = {
            summary: `${nombreCurso}`,
            description: `Sesión del curso ${nombreCurso} para los participantes: ${alumnoCorreo} y ${profesorCorreo}`,
            start: {
                dateTime: `${fecha}`,
                timeZone: 'America/Mexico_City',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'America/Mexico_City',
            },
            attendees: [
                { 'email': `${alumnoCorreo}` },
                { 'email': `${profesorCorreo}` },
            ],
            conferenceData: {
                createRequest: {
                    requestId: (Math.random() + 1).toString(36).substring(7),
                    conferenceSolutionKey: { type: "hangoutsMeet" },
                },
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', 'minutes': 30 },
                    { method: 'email', 'minutes': 30, 'overrides': [{ 'email': `${profesorCorreo}` }] },
                ],
            },
            colorId: 8,
        };

        const calendarResponse = await calendar.events.insert({
            conferenceDataVersion: 1,
            calendarId: 'primary',
            resource: event,
        });

        res.status(200).json({ success: true, message: 'Event created successfully', url: calendarResponse.data.htmlLink });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Error creating event' });
    }
};

module.exports = {
    createEvent
};