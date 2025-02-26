import mongoose from "mongoose";
import ProductsManager from './productManager.js';
import { CartModel } from "../models/Cart.model.js";
import { ProductsModel } from "../models/Product.model.js";


const productManager = new ProductsManager();


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {dbName: 'DDBB_Ecommerce'});
    console.log('Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('Error al conectar a MongoDB Atlas', err);
  }
};


class CartsManager {
 
  async getAllCarts() {
    try {
      const carts = await CartModel.find().populate('products.product').lean();
      return carts;
    } catch (error) {
      console.error('Error al obtener los carritos:', error);
      throw error;
    }
  }

  
  async addCart() {
    try {
      const newCart = new Cart({ products: [] });
      const savedCart = await newCart.save();
      return savedCart._id;
    } catch (error) {
      console.error('Error al agregar un carrito:', error);
      throw error;
    }
  }

 
  async getCart(id) {
    try {
      const cart = await CartModel.findById(id).populate('products.productId');
      if (cart) {
        console.log('Carrito encontrado:', cart);
        return cart;
      } else {
        console.log('Carrito no encontrado');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      throw error;
    }
  }

 
  async addProductToCart(cid, pid) {
    try {
     
      const product = await ProductsModel.findById(pid);
      if (!product) {
        console.log('Producto no encontrado');
        return;
      }

    
      const cart = await CartModel.findById(cid);
      if (!cart) {
        console.log('Carrito no encontrado');
        return;
      }

    
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === pid
      );

      if (productIndex !== -1) {
       
        cart.products[productIndex].quantity++;
      } else {
        
        cart.products.push({ productId: product._id, quantity: 1 });
      }

    
      await cart.save();
      console.log('Producto agregado al carrito');
    } catch (error) {
      console.error('Error al agregar el producto al carrito:', error);
      throw error;
    }
  }

  /* 
  // Método para eliminar un producto del carrito
  async deleteProductFromCart(cid, pid) {
    try {
      const cart = await CartModel.findById(cid);
      if (!cart) {
        console.log('Carrito no encontrado');
        return;
      }

      // Buscar el índice del producto en el carrito
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === pid
      );

      if (productIndex === -1) {
        console.log('Producto no encontrado en el carrito');
        return;
      }

      // Eliminar el producto
      cart.products.splice(productIndex, 1);

      // Guardar el carrito actualizado
      await cart.save();
      console.log('Producto eliminado del carrito');
      return cart; // Retorna el carrito actualizado
    } catch (error) {
      console.error('Error al eliminar el producto del carrito:', error);
      throw error;
    }
  }

 */
  async deleteProductFromCart(cid, pid) {
    try {
      // Buscar el carrito por ID
      const cart = await CartModel.findById(cid);
      if (!cart) {
        console.log('Carrito no encontrado');
        return;
      }
  
      // Asegurarnos de que 'products' es un array
      if (!Array.isArray(cart.products)) {
        console.log('El carrito no contiene productos válidos');
        return;
      }
  
      // Buscar el producto en el carrito
      const productIndex = cart.products.findIndex(
        (item) => item.product && item.product.toString() === pid // Comprobamos si product existe
      );
  
      if (productIndex === -1) {
        console.log('Producto no encontrado en el carrito');
        return;
      }
  
      // Eliminar el producto del carrito
      cart.products.splice(productIndex, 1);
  
      // Guardar el carrito actualizado
      await cart.save();
      console.log('Producto eliminado del carrito');
      return cart; // Retornamos el carrito actualizado
  
    } catch (error) {
      console.error('Error al eliminar el producto del carrito:', error);
      throw error;
    }
  }
  
  


}

export default CartsManager;

