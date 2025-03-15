
import nodemailer from 'nodemailer';
import { config } from '../config/config.js';


const transporter = nodemailer.createTransport({
    host: config.email.HOST,
    port: config.email.PORT,
    secure: false, 
    auth: {
        user: config.email.USER, 
        pass: config.email.PASSWORD, 
    },
});


export const sendResetPasswordEmail = async (email, resetToken) => {
    const resetUrl = `http://localhost:${config.server.port}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"testing@yourapp.com>`, 
        to: email, 
        subject: 'Restablecer Contraseña',
        html: `
            <h1>Restablecimiento de contraseña</h1>
            <p>Deseas restablecer tu contraseña? </p>
            <a href="${resetUrl}" style="background-color:rgb(76, 79, 175); color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">
                Restablecer tu  Contraseña
            </a>
            <p>Este enlace expirará en 15 minutos.</p>
            
        `,
    };

    try {
        
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar el correo de restablecimiento', error);
        throw new Error('Error al enviar el correo de restablecimiento');
    }
};
