import { Router } from 'express';
import { ProductManager } from '../controllers/productManager.js';

const productManager = new ProductManager('./src/models/productos.txt');

const routerProd = Router();

routerProd.get('/', async (req, res) => {
    const { limit } = req.query;

    const prods = await productManager.getProducts();
    const products = limit ? prods.slice(0, limit) : prods;
    res.status(200).send(products);
});

routerProd.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    const prod = await productManager.getProductById(pid);

    if (prod) {
        res.status(200).send(prod);
    } else {
        res.status(404).send("Producto no existente");
    }
});

routerProd.post('/', async (req, res) => {
    const newProduct = req.body;
    await productManager.addProduct(newProduct);
    res.status(201).send("Producto creado correctamente");
});

routerProd.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    await productManager.updateProduct(pid, req.body);
    res.status(200).send("Producto actualizado correctamente");
});

routerProd.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    await productManager.deleteProduct(pid);
    res.status(200).send("Producto eliminado correctamente");
});

export default routerProd;