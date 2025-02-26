import express from 'express';
import productsRoute from './routes/products.router.js';
import cartsRoute from './routes/carts.router.js';
import viewsRoute from './routes/views.router.js';
import homeRoute from './routes/home.router.js';
import realTimeProducts from './routes/realtimeproducts.router.js';
import { __dirname } from './utils.js'
import handlebars from 'express-handlebars'
import path from "path";
import { Server } from 'socket.io';
import ProductsManager from './managers/productManager.js';
import { CartModel } from './models/Cart.model.js'; 
import { mongoConnection } from './connection/mongo.js';
import { engine } from "express-handlebars";
import mongoose from 'mongoose';



const app = express()
mongoConnection()

app.engine('handlebars', engine({
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');


app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(express.static(path.join(__dirname, "public")));

app.use("/", viewsRoute);
app.use('/api/products', productsRoute)
app.use('/api/carts', cartsRoute)
app.use('/home', homeRoute)
app.use('/realtimeproducts', realTimeProducts) 




const productManager = new ProductsManager();



const httpServer = app.listen(8080,()=>{
    console.log("Servidor correctamente Iniciado 8080")
});



export const socketServer = new Server(httpServer)


socketServer.on('connection', async (socket)=>{
    
    const productsList = await productManager.getAllProducts()
    socket.emit('home', productsList) 
    socket.emit('realtime', productsList) 

    socket.on('nuevo-producto', async(producto)=>{  
        await productManager.addProduct(producto)     
        socketServer.emit('realtime', productsList) 
    });

    socket.on('update-product', async (producto)=>{
        await productManager.updateProduct(producto, producto.id) 
        socketServer.emit('realtime',productsList) 
    });

    socket.on('delete-product', async(id) => {
        await productManager.deleteProduct(id)
        socketServer.emit('realtime', productsList) 
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




    /* 
    socket.on('nuevo-producto', async (producto) => {
        await productManager.addProduct(producto);
        const updatedProductsList = await productManager.getAllProducts(); // Actualiza la lista de productos
        socketServer.emit('realtime', updatedProductsList); // Emite la lista actualizada
    });
    
    socket.on('update-product', async (producto) => {
        await productManager.updateProduct(producto, producto.id);
        const updatedProductsList = await productManager.getAllProducts(); // Actualiza la lista de productos
        socketServer.emit('realtime', updatedProductsList); // Emite la lista actualizada
    });
    
    socket.on('delete-product', async (id) => {
        await productManager.deleteProduct(id);
        const updatedProductsList = await productManager.getAllProducts(); // Actualiza la lista de productos
        socketServer.emit('realtime', updatedProductsList); // Emite la lista actualizada
    });

 */