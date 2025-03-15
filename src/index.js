import express from 'express';
import session from "express-session";
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import { initializePassport } from './config/passport.config.js';
import productsRoute from './routes/products.router.js';
import cartsRoute from './routes/carts.router.js';
import viewsRoute from './routes/views.router.js';
import homeRoute from './routes/home.router.js';
import realTimeProducts from './routes/realtimeproducts.router.js';
import { __dirname } from './utils.js';
import handlebars from 'express-handlebars';
import path from "path";
import { Server } from 'socket.io';
import ProductsManager from './managers/productManager.js';
import { CartModel } from './models/Cart.model.js';
import { mongoConnection } from './connection/mongo.js';
import { engine } from "express-handlebars";
import sessionRouter  from "./routes/session.routes.js";

const app = express();
mongoConnection();

app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "s3cr3t", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/", homeRoute);
app.use('/api/products', productsRoute);
app.use('/api/carts', cartsRoute);
app.use('/home', viewsRoute);
app.use('/realtimeproducts', realTimeProducts); 
app.use("/api/sessions", sessionRouter);

const productManager = new ProductsManager();

const httpServer = app.listen(8080, () => {
  console.log("Servidor correctamente Iniciado 8080");
});

export const socketServer = new Server(httpServer);

socketServer.on('connection', async (socket) => {
  const productsList = await productManager.getAllProducts();
  socket.emit('home', productsList); 
  socket.emit('realtime', productsList);

  socket.on('nuevo-producto', async (producto) => {  
    await productManager.addProduct(producto);
    socketServer.emit('realtime', productsList); 
  });

  socket.on('update-product', async (producto) => {
    await productManager.updateProduct(producto, producto.id); 
    socketServer.emit('realtime', productsList); 
  });

  socket.on('delete-product', async (id) => {
    await productManager.deleteProduct(id);
    socketServer.emit('realtime', productsList); 
  });

  socket.on('add-to-cart', async ({ cartId, productId }) => {
    try {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        return socket.emit('error', { message: 'Carrito no encontrado' });
      }

      const productIndex = cart.products.findIndex(prod => prod.product.toString() === productId);
      if (productIndex === -1) {
        cart.products.push({ product: productId, quantity: 1 });
      } else {
        cart.products[productIndex].quantity += 1;
      }

      await cart.save();
      socketServer.emit('cartUpdated', cart);
      socket.emit('cartUpdated', cart);  
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      socket.emit('error', { message: 'Hubo un error al agregar el producto al carrito' });
    }
  });
});

export default app;



