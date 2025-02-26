import mongoose from "mongoose";
/* import ProductsManager from './productManager.js'; */
import { CartModel } from "../models/Cart.model.js";
import { ProductsModel } from "../models/Product.model.js";





const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URL, {dbName: 'DDBB_Ecommerce'});
      console.log('Conectado a MongoDB Atlas');
    } catch (err) {
      console.error('Error al conectar a MongoDB Atlas', err);
    }
  };
  

  class ProductsManager {
    constructor() {
      this.product = {};
      this.productsList = [];
    }
  
    
    async setNewId() {
      const now = await new Date();
      return now.getTime(); 
        }
  
    
    async getProduct(id) {
      try {
        const product = await ProductsModel.findById(id);
        return product ? { ...product.toObject() } : null; // 
      } catch (error) {
        console.error('Error al obtener el producto:', error);
        throw error;
      }
    }
  
  
    async getAllProducts() {
      try {
        const products = await ProductsModel.find();
        return products.map(product => product.toObject()); 
      } catch (error) {
        console.error('Error al obtener los productos:', error);
        throw error;
      }
    }
  
    
    async addProduct(product) {
      try {
        const newProduct = new ProductsModel({
          title: product.title,
          description: product.description || '',
          code: product.code,
          price: product.price || 0,
          status: product.status || true,
          stock: product.stock || 0,
          category: product.category || '',
        });
  
        const savedProduct = await newProduct.save(); 
        console.log('Producto agregado:', savedProduct);
        return savedProduct;
      } catch (error) {
        console.error('Error al agregar el producto:', error);
        throw error;
      }
    }
  
  
    async updateProduct(id, product) {
      try {
        const updatedProduct = await ProductsModel.findByIdAndUpdate(id, product, { new: true });
        if (updatedProduct) {
          console.log('Producto actualizado:', updatedProduct);
          return updatedProduct;
        } else {
          console.log('Producto no encontrado');
          return null;
        }
      } catch (error) {
        console.error('Error al actualizar el producto:', error);
        throw error;
      }
    }
  
    async deleteProduct(id) {
      try {
        const deletedProduct = await ProductsModel.findByIdAndDelete(id);
        if (deletedProduct) {
          console.log('Producto eliminado:', deletedProduct);
          return deletedProduct;
        } else {
          console.log('Producto no encontrado');
          return null;
        }
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        throw error;
      }
    }
  }
  
  export default ProductsManager;






