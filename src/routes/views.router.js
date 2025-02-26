import { Router } from "express";


/* import { cartModelo } from '../models/Cart.model.js'; */

import ProductManager from '../managers/productManager.js';
import CartManager from '../managers/cartsManager.js';

import { CartModel } from "../models/Cart.model.js";
import { ProductsModel } from "../models/Product.model.js";






const viewsRouter  = Router();

const productManager = new ProductManager();
const cartManager = new CartManager();




viewsRouter.route("/products")
.get(async (req, res) => {
    try {
        const { page = 1, limit = 4 } = req.query;

        const products = await ProductsModel.paginate({}, { 
            page: parseInt(page), 
            limit: parseInt(limit),
            lean: true 
        });

        
     


        const productsResult = products.docs.map(
            prod => {
               
               const { _id, ...rest } = prod;
                return {
                    id: _id.toString(),
                    ...rest
                };
            });



        res.render('products', { 
            products: productsResult,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            currentPage: products.page,
            totalPages: products.totalPages
    })
    } catch (error) {
        console.error("No es posible cargar los Productos", error);
        res.status(500).send("Error del servidor , no es posible cargar los Productos");
    }
}) 

viewsRouter.route("/upload")
    .get((req, res) => {
        res.render('upload')
    })
    .post(async (req, res) => {
        try {
            const newProduct = await productManager.addProduct(req.body);
            console.log("Producto cargado satisfactoriamente")
            res.redirect("/products");
        } catch (error) {
            console.error("Error guardando productos", error);
            res.status(500).send("Error del  servidor guardando productos");
        }
    }); 

    viewsRouter.route("/carts")
    .get( async (req, res) => {
        try {
            const carts = await cartManager.getAllCarts();
            const totalCarts = carts.length;
            
            res.render('carts', { 
                carts,
                totalCarts,
                title: "Pagina de Carritos" 
            });
        } catch (error) {
            console.error("Error cargando los Carritos", error);
            res.status(500).send("Error del servidor cargando los Carritos");
        }
    });

 
export default viewsRouter;
