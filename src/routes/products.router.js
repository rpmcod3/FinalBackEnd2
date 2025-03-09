import { Router } from "express";
import ProductsManager from '../managers/productManager.js';
import { __dirname } from '../utils.js'
import { socketServer } from "../index.js";
import { ProductsModel } from "../models/Product.model.js";

const router = Router()
const productManager = new ProductsManager();


    router.get("/", async (req, res) => {
        const { limit = 10, page = 1, sort = '', ...query } = req.query;
        const sortManager = {
          'asc': 1,
          'desc': -1
        }
      
        const products = await ProductsModel.paginate(
          { ...query },
          { 
            limit,
            page,
            ...(sort && { sort: { price: sortManager[sort]} }),
            customLabels: { docs: 'payload' }
          })
      
        res.json({
          ...products,
          status: 'success'
        });
      });



    router.get("/:id", async (req, res) => {
        const { id } = req.params;
        
      
        const productFinded = await ProductsModel.findById(id);
      
        const status = productFinded ? 200 : 404;
      
        res.status(status).json({ payload: productFinded });
      });

      router.post("/",  async (req, res) => {
       
     
      
        const prod = req.body;
        const result = await ProductsModel.create({
          ...prod,
       
        });
        
        res.status(201).json({ payload: result });
      });

      router.put("/:id",  async (req, res) => {
        const { body, params } = req;
        const { id } = params;
        const product = body;
        const productUpdated = await ProductsModel.findByIdAndUpdate(id, {
          ...product,
         
        }, { new: true });
      
        res.status(201).json({ message: "Updated successfully", payload: productUpdated });
      });
      
 /*      router.delete("/:id", async (req, res) => {
        const { id } = req.params;
        const isDelete = await ProductsModel.findByIdAndDelete(id);
      
        res.status(isDelete ? 200 : 400).json({ payload: isDelete });
      }); */

      /* router.delete("/:id", async (req, res) => {
        const { id } = req.params;
        console.log("Eliminar producto con id:", id);  // Esto para verificar que el id es correcto
      
        try {
          const isDelete = await ProductsModel.findByIdAndDelete(id);
          
          if (isDelete) {
            console.log(`Producto con id ${id} eliminado`);
            res.status(200).json({ payload: isDelete });
          } else {
            console.log(`Producto con id ${id} no encontrado`);
            res.status(400).json({ message: 'Producto no encontrado' });
          }
        } catch (error) {
          console.error("Error al eliminar el producto:", error);
          res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
        }
      }); */
      /* 
      router.delete("/:id", async (req, res) => {
        const { id } = req.params;
        console.log("Eliminar producto con id:", id);


        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID no válido" });
        }
      
        try {
          const deletedProduct = await ProductsModel.findByIdAndDelete(id);
      
          if (!deletedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
          }
      
          return res.status(200).json({ message: "Producto eliminado correctamente" });
        } catch (error) {
          console.error("Error al eliminar el producto:", error);
          return res.status(500).json({ message: "Error interno del servidor" });
        }
      }); */
      router.delete("/:id", async (req, res) => {
        const { id } = req.params;
      
        // Verifica si el ID es válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID no válido" });
        }
      
        try {
          const deletedProduct = await ProductsModel.findByIdAndDelete(id);
      
          if (!deletedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
          }
      
          return res.status(200).json({ message: "Producto eliminado correctamente" });
        } catch (error) {
          console.error("Error al eliminar el producto:", error);
          return res.status(500).json({ message: "Error interno del servidor" });
        }
      });
      

    

export default router