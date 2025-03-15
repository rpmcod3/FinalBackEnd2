import { generateToken } from "../utils/jwt.js";
import { sendResetPasswordEmail } from '../services/email.service.js';
import { userModel } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthController {
  
  static async login(req, res) {
    const payload = {
      email: req.user.email,
      role: req.user.role,
    };

    const token = generateToken(payload);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600, 
    });
    res.json({ message: "Login successful" });
  }

  
  static async register(req, res) {
    if (!req.user) {
      return res.status(400).json({ message: "User registration failed." });
    }
    res.json(req.user);
  }

  
  static async current(req, res) {
    res.json(req.user);
  }

  
  static async requestPasswordReset(req, res) {
    const { email } = req.body;

   
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    try {
      
      await sendResetPasswordEmail(email, resetToken);
      res.status(200).json({ message: "Correo enviado para restablecer la contraseña." });
    } catch (error) {
      res.status(500).json({ message: "Error al enviar el correo de restablecimiento." });
    }
  }

  
  static async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "El token de restablecimiento es inválido o ha expirado." });
    }

    const { email } = decoded;

    
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

   
    user.password = hashedPassword;

    try {
      await user.save();
      res.status(200).json({ message: "Contraseña restablecida exitosamente." });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar la contraseña." });
    }
  }
}

