const https = require('https');

// Configuración Wompi
const WOMPI_CONFIG = {
  PUBLIC_KEY: process.env.WOMPI_PUBLIC_KEY || 'pub_test_u8lQ4lEUEc8u6UHWKFHtDEDVq2vAdZbX',
  PRIVATE_KEY: process.env.WOMPI_PRIVATE_KEY || 'prv_test_dW7JCEsVTz1MgAN4wGi5yU0nbTMf4w9a'
};

// Crear transacción usando Payment Links de Wompi (método oficial)
const crearTransaccion = async (req, res) => {
  try {
    console.log('🔄 Recibida petición:', req.body);
    
    const { amount, customerEmail, customerName, description } = req.body;

    // Validación básica
    if (!amount || !customerEmail || !customerName) {
      return res.status(400).json({
        success: false,
        mensaje: 'Faltan campos obligatorios'
      });
    }

    // Crear payment link usando la API oficial de Wompi
    const reference = `FUEL_${Date.now()}`;
    
    const paymentLinkData = {
      name: `Donación - ${customerName}`,
      description: description || 'Donación Fuel para Developers',
      single_use: true,
      collect_shipping: false,
      currency: 'COP',
      amount_in_cents: Math.round(amount * 100),
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/fuel-devs?status=success&ref=${reference}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('📤 Creando payment link en Wompi...', paymentLinkData);

    const postData = JSON.stringify(paymentLinkData);

    const options = {
      hostname: 'sandbox.wompi.co',
      port: 443,
      path: '/v1/payment_links',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOMPI_CONFIG.PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const wompiRequest = https.request(options, (wompiRes) => {
      let responseBody = '';
      
      wompiRes.on('data', (chunk) => {
        responseBody += chunk;
      });

      wompiRes.on('end', () => {
        try {
          console.log('📥 Respuesta de Wompi:', {
            statusCode: wompiRes.statusCode,
            body: responseBody
          });

          const response = JSON.parse(responseBody);
          
          if (wompiRes.statusCode === 201 || wompiRes.statusCode === 200) {
            console.log('✅ Payment link creado exitosamente');
            console.log('📋 Respuesta completa de Wompi:', JSON.stringify(response, null, 2));
            
            // Construir la URL de checkout usando el ID del payment link
            const paymentLinkId = response.data?.id;
            const checkoutUrl = `https://checkout.wompi.co/l/${paymentLinkId}`;
            
            console.log('🔍 Payment Link ID:', paymentLinkId);
            console.log('🔗 URL de checkout construida:', checkoutUrl);
            
            res.status(200).json({
              success: true,
              mensaje: 'Payment link creado exitosamente',
              data: {
                paymentLinkId: paymentLinkId,
                checkoutUrl: checkoutUrl,
                permalink: checkoutUrl,
                reference: reference,
                wompiData: {
                  id: response.data?.id,
                  active: response.data?.active,
                  expires_at: response.data?.expires_at
                }
              }
            });
          } else {
            console.error('❌ Error Wompi:', response);
            res.status(400).json({
              success: false,
              mensaje: 'Error al crear payment link en Wompi',
              error: response,
              debug: {
                statusCode: wompiRes.statusCode,
                responseBody
              }
            });
          }
        } catch (parseError) {
          console.error('❌ Error parsing Wompi response:', parseError);
          res.status(500).json({
            success: false,
            mensaje: 'Error al procesar respuesta de Wompi',
            debug: { responseBody }
          });
        }
      });
    });

    wompiRequest.on('error', (error) => {
      console.error('❌ Error en request a Wompi:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error de conexión con Wompi',
        error: error.message
      });
    });

    wompiRequest.write(postData);
    wompiRequest.end();

  } catch (error) {
    console.error('❌ Error en crearTransaccion:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Webhook básico
const webhookConfirmacion = async (req, res) => {
  try {
    console.log('Webhook recibido:', req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ success: false });
  }
};

// Verificar transacción básica
const verificarTransaccion = async (req, res) => {
  try {
    const { transactionId } = req.params;
    res.json({
      success: true,
      data: {
        id: transactionId,
        status: 'PENDING'
      }
    });
  } catch (error) {
    console.error('Error en verificarTransaccion:', error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  crearTransaccion,
  webhookConfirmacion,
  verificarTransaccion
};