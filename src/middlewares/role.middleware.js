
export function checkAdminRole(req, res, next) {
    if (req.user && req.user.role === "admin") {
      return next(); 
    } else {
      return res.status(403).json({ message: "No tienes permisos de administrador" });
    }
  }
  
  export function checkUserRole(req, res, next) {
    if (req.user && req.user.role === "user") {
      return next(); 
    } else {
      return res.status(403).json({ message: "No tienes permisos de usuario" });
    }
  }
  