const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function GoogleVerify(token = '') {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const data = ticket.getPayload();

    const nombre = data.given_name;
    const apellido = data.family_name;
    const correo = data.email
    const imagen = data.picture;


    return{
        nombre,
        apellido,
        imagen,
        correo
    }
}

module.exports = {
    GoogleVerify
}