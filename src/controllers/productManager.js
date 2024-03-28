import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.products = [];
  }

  async addProduct(product) {
    await this.loadProductsFromFile();
    
    if (!product.title || !product.description || !product.price || !product.category || !product.code || !product.stock) {
      console.error('Todos los campos del producto son obligatorios.');
      return;
    }

    if (this.products.some(p => p.code === product.code)) {
      console.error('Ya existe un producto con el mismo código.');
      return;
    }

    product.id = uuidv4();
    product.status = true; // Cambio aquí para asegurarnos de que status siempre sea true
    this.products.push(product);
    console.log('Producto agregado correctamente:', product);
    await this.saveProductsToFile();
  }

  async getProductById(id) {
    await this.loadProductsFromFile();
    
    const product = this.products.find(product => product.id === id);

    if (product) {
      console.log(product);
      return product;
    } else {
      console.log("Producto no encontrado");
      return null;
    }
  }

  async getProducts() {
    await this.loadProductsFromFile();
    return this.products;
  }

  async updateProduct(id, updatedProduct) {
    await this.loadProductsFromFile();
    
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      // Asegurarnos de que status sea true incluso si updatedProduct.status es false
      this.products[productIndex] = { ...this.products[productIndex], ...updatedProduct, status: true };
      await this.saveProductsToFile();
      console.log('Producto actualizado correctamente:', this.products[productIndex]);
    } else {
      console.error('Producto no encontrado.');
    }
  }

  async deleteProduct(id) {
    await this.loadProductsFromFile();
    
    const initialProductCount = this.products.length;
    this.products = this.products.filter(p => p.id !== id);

    if (this.products.length === initialProductCount) {
      console.error('Producto no encontrado.');
    } else {
      await this.saveProductsToFile();
      console.log('Producto eliminado correctamente.');
    }
  }

  async loadProductsFromFile() {
    try {
      const productsData = await fs.readFile(this.filePath, 'utf-8');
      this.products = JSON.parse(productsData);
    } catch (error) {
      this.products = [];
    }
  }

  async saveProductsToFile() {
    await fs.writeFile(this.filePath, JSON.stringify(this.products, null, 2));
  }
}