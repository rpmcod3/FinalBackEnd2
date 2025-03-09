import { Router } from "express";
import CartsManager from "../managers/cartsManager.js";
import { __dirname } from '../utils.js';
import { CartModel } from '../models/Cart.model.js';
import ProductsManager from '../managers/productManager.js';
import { socketServer } from "../index.js";
import { ProductsModel } from "../models/Product.model.js";



const router = Router()
const cartsManager = new CartsManager(__dirname + '/models/carts.json');


router.post('/', async (req, res) => {
    const newCart = await CartModel.create({
        products: [],
    })

    res.status(201).json({ message: 'Guardado', cart: newCart })
});




// Obtener todos los carritos con parámetros opcionales de filtro
router.get('/', async (req, res) => {
  try {
    // Extraer parámetros de consulta y asignar valores por defecto
    const { page = 1, limit = 10, sort = 'asc', query = '' } = req.query;

    // Convertir page y limit a números enteros
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Construir condiciones de búsqueda basadas en `query`
    const searchConditions = query ? { 'products.product.title': new RegExp(query, 'i') } : {}; 

    // Definir ordenamiento: ascendente o descendente por precio
    const sortConditions = sort === 'desc' ? { 'products.price': -1 } : { 'products.price': 1 };

    // Consultar la base de datos con paginación, limit y ordenamiento
    const carts = await CartModel.find(searchConditions)
      .skip((pageNum - 1) * limitNum) // Saltar las páginas anteriores
      .limit(limitNum) // Limitar el número de resultados por página
      .sort(sortConditions) // Ordenar por precio
      .populate('products.product') // Población de los productos dentro del carrito
      .lean();

    // Obtener el total de carritos para la paginación
    const totalCarts = await CartModel.countDocuments(searchConditions);

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalCarts / limitNum);

    // Responder con el resultado
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






/* router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
	
    const cartFinded = await CartModel.findById(cid).populate('products.product').lean();

    const status = cartFinded ? 200 : 404;

    res.status(status).json({ productList: cartFinded?.products });
}); */

router.get('/:cid', async (req, res) => {
  const { cid } = req.params;  // Obtener el ID del carrito desde los parámetros de la ruta
  
  try {
      // Buscar el carrito por su ID y realizar un populate para obtener los productos completos
      const cartFinded = await CartModel.findById(cid)
          .populate('products.product')  // Esto hace el populate en el campo "product"
          .lean();  // Usamos .lean() para obtener un objeto plano (sin métodos de Mongoose)
      
      // Si no se encuentra el carrito, devolver un error
      if (!cartFinded) {
          return res.status(404).json({ message: 'Carrito no encontrado' });
      }

      // Responder con el carrito y los productos completos
      res.status(200).json({
          message: 'Carrito encontrado',
          productList: cartFinded.products,  // Devuelve la lista de productos con los datos completos
      });
  } catch (error) {
      // Manejo de errores si ocurre algo inesperado
      console.error('Error al obtener el carrito:', error);
      res.status(500).json({ message: 'Error al obtener el carrito', error: error.message });
  }
});



/* 
//Modificación en el método PUT /:cid:

router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  // Buscar el carrito por su ID
  const cartFinded = await CartModel.findById(cid).lean();
  if (!cartFinded) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  // Verificar que el formato de los productos es correcto
  if (!Array.isArray(products) || !products.every(p => p.product && p.quantity >= 0)) {
    return res.status(400).json({ message: 'El formato de los productos es incorrecto' });
  }

  // Verificar que todos los productos existan en la base de datos
  for (const item of products) {
    const product = await ProductsModel.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: `Producto con ID ${item.product} no encontrado` });
    }
  }

  // Actualizar los productos en el carrito
  // El método `findByIdAndUpdate` reemplaza el carrito, pero no es necesario reemplazar toda la información, solo actualizar el campo de productos.
  const updatedCart = await CartModel.findByIdAndUpdate(
    cid,
    { $set: { products: products } },  // Aquí solo actualizamos el campo `products`
    { new: true }  // Esto retorna el carrito actualizado
  ).populate('products.product');

  // Responder con el carrito actualizado
  res.status(200).json({
    message: 'Carrito actualizado',
    cart: updatedCart
  });
});

 */


router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body; 
    
    const cartFinded = await CartModel.findById(cid).lean();
    if (!cartFinded) return res.status(404).json({ message: 'Carrito no encontrado' });
  
    
    if (!Array.isArray(products) || !products.every(p => p.product && p.quantity >= 0)) {
      return res.status(400).json({ message: 'El formato de los productos es incorrecto' });
    }
  
    
    for (const item of products) {
      const product = await ProductsModel.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.product} no encontrado` });
      }
    }
  
    
    const newCart = {
      ...cartFinded,
      products
    };
    
 
    const cartUpdated = await CartModel.findByIdAndUpdate(cid, newCart, {
      new: true,
    }).populate('products.product');
  
 
    res.status(200).json({ message: 'Carrito actualizado', cart: cartUpdated });
  });

  
 /* router.put('/:cid/product/:pid', async (req, res)=> {
    const { cid } = req.params;
    const { pid } = req.body;
    const {newQuantity} = req.body;

    const cartUpdated = await CartModel.updateProductQuantity(cid, pid, newQuantity);
    res.status(201).json({message: 'Carrito actualizado', cart:cartUpdated})
}); */

 

//Modificacion put cidorduct/pid

router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { newQuantity } = req.body;

  // Validar que la nueva cantidad sea un número y mayor o igual a 0
  if (typeof newQuantity !== 'number' || newQuantity < 0) {
      return res.status(400).json({ message: 'Cantidad inválida' });
  }

  // Buscar el carrito por su ID
  const cart = await CartModel.findById(cid);
  if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  // Buscar el producto en el carrito
  const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
  if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
  }

  // Actualizar solo la cantidad del producto
  cart.products[productIndex].quantity = newQuantity;

  // Guardar el carrito actualizado
  const updatedCart = await cart.save();

  res.status(200).json({ message: 'Cantidad actualizada', cart: updatedCart });
});



router.post('/:cid/product/:pid', async (req, res) => {
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





router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    const cartFinded = await CartModel.findById(cid).lean();
    if(!cartFinded) res.status(404).json({ message: 'error' });

    const newCart = {
        ...cartFinded,
        products: []
    }
    const cartUpdated = await CartModel.findByIdAndUpdate(cid,newCart, {
        new: true,
    })

    res.status(201).json({ message: 'Carrito Vacio', cart: cartUpdated})
});





router.delete('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cartUpdated = await cartsManager.deleteProductFromCart(cid, pid);
    if (cartUpdated) {
      res.status(200).json({ message: 'Producto eliminado del carrito', cart: cartUpdated });
    } else {
      res.status(404).json({ message: 'Carrito o producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto del carrito', error: error.message });
  }
});



export default router;