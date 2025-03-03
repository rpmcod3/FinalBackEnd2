import { Router } from "express";
import ProductsManager from '../class/productManager.js'
import { __dirname } from '../utils.js'
import { socketServer } from "../index.js";
import { productModel } from "../models/Product.model.js";

const router = Router()



    router.get("/", async (req, res) => {
        const { limit = 10, page = 1, sort = '', ...query } = req.query;
        const sortManager = {
          'asc': 1,
          'desc': -1
        }
      
        const products = await productModel.paginate(
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
      
        const productFinded = await productModel.findById(id);
      
        const status = productFinded ? 200 : 404;
      
        res.status(status).json({ payload: productFinded });
      });

      router.post("/",  async (req, res) => {
       
     
      
        const prod = req.body;
        const result = await productModel.create({
          ...prod,
       
        });
        
        res.status(201).json({ payload: result });
      });

      router.put("/:id",  async (req, res) => {
        const { body, params } = req;
        const { id } = params;
        const product = body;
        const productUpdated = await productModel.findByIdAndUpdate(id, {
          ...product,
         
        }, { new: true });
      
        res.status(201).json({ message: "Updated successfully", payload: productUpdated });
      });
      
      router.delete("/:id", async (req, res) => {
        const { id } = req.params;
        const isDelete = await productModel.findByIdAndDelete(id);
      
        res.status(isDelete ? 200 : 400).json({ payload: isDelete });
      });

export default router