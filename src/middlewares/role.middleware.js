
export function checkAdminRole(req, res, next) {
    if (req.user && req.user.role === "admin") {
      return next(); // Permitir acción para administradores
    } else {
      return res.status(403).json({ message: "No tienes permisos de administrador" });
    }
  }
  
  export function checkUserRole(req, res, next) {
    if (req.user && req.user.role === "user") {
      return next(); // Permitir acción para usuarios
    } else {
      return res.status(403).json({ message: "No tienes permisos de usuario" });
    }
  }
  