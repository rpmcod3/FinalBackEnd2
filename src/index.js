import express from 'express'
import producsRoute from './routes/products.router.js'
import cartsRoute from './routes/carts.router.js'
import homeRoute from './routes/home.router.js'
import realTimeProducts from './routes/realtimeproducts.router.js'
import { __dirname } from './utils.js'
import handlebars from 'express-handlebars'
import {Server} from 'socket.io'
import ProductsManager from './class/productManager.js'
import { mongoConnection } from './connection/mongo.js'


import morgan from 'morgan'; 
import mongoose from 'mongoose';
import passport from 'passport' 
import cookieParser from 'cookie-parser';
import { initializePassport } from './config/passport.config.js';
import { authRouter } from './routes/auth.routes.js';




const app = express()
mongoConnection()

const productManager = new ProductsManager(__dirname + '/models/products.json');

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(express.static(__dirname + '/public'))

app.use(morgan("dev"));
app.use(cookieParser());


app.use('/api/products', producsRoute)
app.use('/api/carts', cartsRoute)
app.use('/home', homeRoute)
app.use('/realtimeproducts', realTimeProducts) 


initializePassport();
app.use(passport.initialize());


app.use("auth", authRouter)



const httpServer = app.listen(8080,()=>{
    console.log("Servidor correctamente Iniciado")
})

export const socketServer = new Server(httpServer)



socketServer.on('connection', async (socket)=>{
    
    const productsList = await productManager.getAllProducts()
    socket.emit('home', productsList) 
    socket.emit('realtime', productsList) 
    socket.on('nuevo-producto', async(producto)=>{  
        await productManager.addProduct(producto)     
        socketServer.emit('realtime', productsList) 
    })


    socket.on('update-product', async (producto)=>{
        await productManager.updateProduct(producto, producto.id) 
        socketServer.emit('realtime',productsList) 
    })

   
    socket.on('delete-product', async(id) => {
        await productManager.deleteProduct(id)
        socketServer.emit('realtime', productsList) 
    })
})



