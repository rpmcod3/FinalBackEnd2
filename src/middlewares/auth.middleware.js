import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';
import { userModel } from '../models/user.model.js';


export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};


export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador' });
  }
  next();
};

export const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Acceso denegado, solo los usuarios pueden agregar productos al carrito' });
  }
  next();
};
