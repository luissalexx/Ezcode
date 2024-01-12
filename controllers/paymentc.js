const { response, request } = require('express');
const axios = require("axios");
const PDFDocument = require('pdfkit');
const path = require('path');
const SolicitudCurso = require('../models/SolicitudCurso');
const Profesor = require('../models/Profesor');
const Anuncio = require('../models/Anuncio');
const Curso = require('../models/Curso');
const Cliente = require('../models/Cliente');
const { PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET } = process.env;

const createOrder = async (req = request, res = response) => {
    try {
        const { precio, nombre } = req.params;
        const { idProducto, idCliente } = req.body;

        const solicitudRes = await SolicitudCurso.findOne({ anuncio: idProducto });
        const solicitudId = solicitudRes._id;

        const order = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "MXN",
                        value: `${precio}`,
                    },
                    description: `${nombre}`,
                },
            ],
            application_context: {
                brand_name: "Ezecode",
                landing_page: "NO_PREFERENCE",
                user_action: "PAY_NOW",
                return_url: `http://localhost:8080/api/pago/capture-order/${solicitudId}/${idCliente}`,
                cancel_url: `http://localhost:8080/api/pago/cancel-order`,
            },
        };

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");

        const { data: { access_token } } = await axios.post(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth: {
                    username: PAYPAL_API_CLIENT,
                    password: PAYPAL_API_SECRET,
                },
            }
        );

        const paypalResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders`,
            order,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return res.json(paypalResponse.data);
    } catch (error) {
        console.error(`Error creating order: ${error.message}`);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

const captureOrder = async (req = request, res = response) => {
    try {
        const { idSolicitud, idCliente } = req.params;
        const { token } = req.query;

        const captureResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
            {},
            {
                auth: {
                    username: PAYPAL_API_CLIENT,
                    password: PAYPAL_API_SECRET,
                },
            }
        );

        if (captureResponse) {
            try {
                const solicitud = await SolicitudCurso.findByIdAndUpdate(
                    idSolicitud,
                    { pagado: true },
                    { new: true }
                );
 
                const profesor = await Profesor.findById(solicitud.profesor);
                const anuncio = await Anuncio.findById(solicitud.anuncio);
                profesor.notificaciones.push({
                    mensaje: `Han completado la compra del curso: ${anuncio.nombre}, revisa tu panel de cuenta`,
                });
                await profesor.save();

                const data = {
                    nombre: anuncio.nombre,
                    descripcion: anuncio.descripcion,
                    categoria: anuncio.categoria,
                    imagen: anuncio.imagen,
                    profesor: solicitud.profesor,
                    alumno: idCliente,
                    anuncio: anuncio._id
                };

                if (solicitud.pagado == true) {
                    anuncio.suscripciones = anuncio.suscripciones + 1;
                    await anuncio.save();

                    const curso = new Curso(data);
                    await curso.save();

                    const alumno = await Cliente.findById(curso.alumno);
                    alumno.notificaciones.push({
                        mensaje: `Se ha creado el curso: ${curso.nombre}, revisa tu panel de cuenta`,
                    });
                    await alumno.save();

                    await SolicitudCurso.findByIdAndDelete(idSolicitud);
                }
            } catch (error) {
                console.error(`Error processing capture response: ${error.message}`);
            }
        }

        let fullName, paymentStatus, paymentAmount;

        captureResponse.data.purchase_units.forEach((purchaseUnit, index) => {
            fullName = purchaseUnit.shipping.name.full_name;
            const paymentCapture = purchaseUnit.payments.captures[0];
            if (paymentCapture) {
                paymentStatus = paymentCapture.status;
                paymentAmount = paymentCapture.amount.value;
            }
        });

        generatePDF({ fullName, paymentStatus, paymentAmount }, res);

    } catch (error) {
        console.error(`Error capturing order: ${error.message}`);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

const createOrderTema = async (req = request, res = response) => {
    try {
        const { precio, nombre, idTema } = req.params;

        const order = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "MXN",
                        value: `${precio}`,
                    },
                    description: `${nombre}`,
                },
            ],
            application_context: {
                brand_name: "Ezecode",
                landing_page: "NO_PREFERENCE",
                user_action: "PAY_NOW",
                return_url: `http://localhost:8080/api/pago/capture-order-tema/${idTema}`,
                cancel_url: `http://localhost:8080/api/pago/cancel-order`,
            },
        };

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");

        const { data: { access_token } } = await axios.post(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth: {
                    username: PAYPAL_API_CLIENT,
                    password: PAYPAL_API_SECRET,
                },
            }
        );

        const paypalResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders`,
            order,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return res.json(paypalResponse.data);
    } catch (error) {
        console.error(`Error creating order: ${error.message}`);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

const captureOrderTema = async (req = request, res = response) => {
    try {
        const { idTema } = req.params;
        const { token } = req.query;

        const captureResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
            {},
            {
                auth: {
                    username: PAYPAL_API_CLIENT,
                    password: PAYPAL_API_SECRET,
                },
            }
        );

        if (captureResponse) {
            try {
                const curso = await Curso.findOneAndUpdate(
                    { 'temas._id': idTema },
                    { $set: { 'temas.$.pagado': true } },
                    { new: true }
                );

                if (!curso) {
                    return res.status(404).json({ mensaje: 'Tema no encontrado' });
                }
            } catch (error) {
                console.error(`Error processing capture response: ${error.message}`);
            }
        }

        let fullName, paymentStatus, paymentAmount;

        captureResponse.data.purchase_units.forEach((purchaseUnit, index) => {
            fullName = purchaseUnit.shipping.name.full_name;
            const paymentCapture = purchaseUnit.payments.captures[0];
            if (paymentCapture) {
                paymentStatus = paymentCapture.status;
                paymentAmount = paymentCapture.amount.value;
            }
        });

        generatePDF({ fullName, paymentStatus, paymentAmount }, res);

    } catch (error) {
        console.error(`Error capturing order: ${error.message}`);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

const generatePDF = (data, res) => {
    const doc = new PDFDocument();
    const ezecodePath = path.join(__dirname, '../assets/ezecode.png');
    res.attachment('recibo.pdf');

    doc.pipe(res);

    doc.image(ezecodePath, 50, 50, { width: 50 });

    doc.moveDown();

    doc.text('Recibo de Pago', { align: 'center', fontSize: 16, margin: [0, 0, 0, 20] });

    const headers = ['Nombre Completo', 'Estado del Pago', 'Importe'];

    const tableData = [
        [data.fullName, data.paymentStatus, data.paymentAmount],
    ];

    let y = doc.y + 30;

    headers.forEach((header, i) => {
        doc.text(header, 50 + i * 150, y, { width: 150, align: 'left' });
    });

    tableData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            doc.text(cell, 50 + colIndex * 150, y + (rowIndex + 1) * 20, { width: 150, align: 'left' });
        });
    });

    doc.end();
};

const cancelOrder = async (req = request, res = response) => {
    res.send('<script>window.close();</script>');
}

module.exports = {
    createOrder,
    captureOrder,
    cancelOrder,
    createOrderTema,
    captureOrderTema
}
