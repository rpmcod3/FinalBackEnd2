import { Router } from "express";
import ProductsManager from '../class/productManager.js';
import CartsManager from "../class/cartsManager.js";
import { __dirname } from '../utils.js';
import { cartModel } from '../models/Cart.model.js';


const router = Router()
const cartsManager = new CartsManager(__dirname + '/models/carts.json');


router.post('/', async (req, res) => {
    const newCart = await cartModel.create({
        products: [],
    })

    res.status(201).json({ message: 'Guardado', cart: newCart })
});

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
	
    const cartFinded = await cartModel.findById(cid).populate('products.product');

    const status = cartFinded ? 200 : 404;

    res.status(status).json({ productList: cartFinded?.products });
});

router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body

    const cartFinded = await cartModel.findById(cid).lean();
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const newCart = {
        ...cartFinded,
        products
    }
    
    const cartUpdated = await cartModel.findByIdAndUpdate(cid,newCart, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Products limpio', cart: cartUpdated})

});


router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    const cartFinded = await cartModel.findById(cid);
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const indexProd = cartFinded.products.findIndex(prod => prod.product.toString() === pid);
    if(indexProd === -1){
        cartFinded.products.push({ product: pid, quantity: 1 })
    } else {
        cartFinded.products[indexProd] = { product: cartFinded.products[indexProd].product, quantity: cartFinded.products[indexProd].quantity + 1 }
    }
    const cartUpdated = await cartModel.findByIdAndUpdate(cid,cartFinded, {
        new: true,
    }).populate('products.product')

    res.status(201).json({ message: 'Product Añadido', cart: cartUpdated})

});



router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    const cartFinded = await cartModel.findById(cid).lean();
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const newCart = {
        ...cartFinded,
        products: []
    }
    const cartUpdated = await cartModel.findByIdAndUpdate(cid,newCart, {
        new: true,
    })

    res.status(201).json({ message: 'Products clean', cart: cartUpdated})

});



export default router