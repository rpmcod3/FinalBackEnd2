import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import { JWT_SECRET } from "../utils/jwt.js";
import { userModel } from "../models/user.model.js";
import { createHash, verifyPassword } from "../utils/hash.js";

export function initializePassport() {
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        console.log("Received request body:", req.body);
        

        const { first_name, last_name, age, role } = req.body;
        console.log("Extracted fields:", { first_name, last_name, age, role });

      if (!email || !password || !first_name || !last_name || !age) {
      return done(null, false, { message: "Error, todos los campos son requeridos" });
}

        

          
const hashedPassword = await createHash(password);
try {
  // Create the user
  const user = await userModel.create({
    email,
    password: hashedPassword,
    first_name: first_name,  
    last_name: last_name,    
    age,
    role: role || "user"
  });



          console.log("User created successfully:", user);  

          return done(null, user);
        } catch (error) {

           
        if (error.code === 11000) {
          return done(null, false, { message: "El correo ya está registrado" });
        }

        console.log("Error during user creation:", error);
        return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await userModel.findOne({
            email,
          });

          if (!user) return done(null, false, { message: "Usuario no encontrado" });

          /* const isValidPassword = await verifyPassword(password, user.password); */
          const isValidPassword = await verifyPassword(password, user.password);

console.log("Usuario encontrado:", user.email);
console.log("Contraseña ingresada:", password);
console.log("Contraseña en BD:", user.password);
console.log("¿Contraseña válida?:", isValidPassword);



          if (!isValidPassword)
            return done(null, false, { message: " password invalido " });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "jwt", 
    new JWTStrategy(
      {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      },
      async (payload, done) => {
        try {
          return done(null, payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);

      return done(null, user);
    } catch (error) {
      done(error);
    }
  });
}


function cookieExtractor(req) {
  let token = null;

  if (req && req.cookies) {
    token = req.cookies.token;
  }

  return token;
}
