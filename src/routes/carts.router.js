import { Router } from "express";
import CartsManager from "../managers/cartsManager.js";
import { __dirname } from '../utils.js';
import { CartModel } from '../models/Cart.model.js';
import ProductsManager from '../managers/productManager.js';
import { socketServer } from "../index.js";
import { ProductsModel } from "../models/Product.model.js";
import { TicketModel } from "../models/ticket.model.js"; 
import { isAuthenticated, isUser } from "../middlewares/auth.middleware.js"; 



const router = Router()
const cartsManager = new CartsManager(__dirname + '/models/carts.json');



router.post('/', isAuthenticated, async (req, res) => {
  const newCart = await CartModel.create({
      products: [],
  });

  res.status(201).json({ message: 'Guardado', cart: newCart });
});


router.get('/', isAuthenticated, async (req, res) => {
  try {
     
      const { page = 1, limit = 10, sort = 'asc', query = '' } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const searchConditions = query ? { 'products.product.title': new RegExp(query, 'i') } : {};
      const sortConditions = sort === 'desc' ? { 'products.price': -1 } : { 'products.price': 1 };

      const carts = await CartModel.find(searchConditions)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .sort(sortConditions)
          .populate('products.product')
          .lean();

      const totalCarts = await CartModel.countDocuments(searchConditions);
      const totalPages = Math.ceil(totalCarts / limitNum);

      res.status(200).json({
          status: 'success',
          payload: carts,
          totalPages,
          page: pageNum,
          hasPrevPage: pageNum > 1,
          hasNextPage: pageNum < totalPages,
          prevPage: pageNum > 1 ? pageNum - 1 : null,
          nextPage: pageNum < totalPages ? pageNum + 1 : null
      });

  } catch (error) {
      console.error("Error al obtener los carritos:", error);
      res.status(500).json({ status: 'error', message: 'Error al obtener los carritos' });
  }
});


router.post('/:cid/product/:pid', isAuthenticated, isUser, async (req, res) => {
  const { cid, pid } = req.params;

  let cartFinded = await CartModel.findById(cid);

  if (!cartFinded) {
      cartFinded = new CartModel({
          _id: cid,
          products: []
      });
  }

  const indexProd = cartFinded.products.findIndex(prod => prod.product.toString() === pid);
  
  if (indexProd === -1) {
      cartFinded.products.push({ product: pid, quantity: 1 });
  } else {
      cartFinded.products[indexProd] = { 
          product: cartFinded.products[indexProd].product, 
          quantity: cartFinded.products[indexProd].quantity + 1 
      };
  }

  const cartUpdated = await CartModel.findByIdAndUpdate(cid, cartFinded, {
      new: true,
  }).populate('products.product');

  res.status(201).json({ message: 'Producto añadido al carrito', cart: cartUpdated });
});





router.post('/:cid/purchase', isAuthenticated, isUser, async (req, res) => {
  const { cid } = req.params;
  try {
    
    const cart = await CartModel.findById(cid).populate('products.product').lean();

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    
    if (cart.products.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    
    const outOfStockProducts = [];
    const purchasedProducts = [];
    
    
    for (const item of cart.products) {
      const product = await ProductsModel.findById(item.product._id);
      
      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.product._id} no encontrado` });
      }

      if (product.stock < item.quantity) {
        
        outOfStockProducts.push({
          product: item.product.title,
          requestedQuantity: item.quantity,
          availableStock: product.stock,
        });
      } else {
        
        product.stock -= item.quantity;
        await product.save();
        purchasedProducts.push(item);
      }
    }

    
    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        message: 'No hay suficiente stock para algunos productos',
        outOfStockProducts
      });
    }

    
    const totalAmount = purchasedProducts.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const ticket = await TicketModel.create({
      code: `TICKET-${Date.now()}`,  
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: cart.purchaser, 
    });

    
    const remainingProducts = cart.products.filter(item => !purchasedProducts.includes(item));

    
    await CartModel.findByIdAndUpdate(cid, { products: remainingProducts });

    
    res.status(200).json({
      message: 'Compra finalizada correctamente',
      ticket,
    });
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


export default router;
