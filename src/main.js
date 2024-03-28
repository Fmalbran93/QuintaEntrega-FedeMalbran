import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import routerProd from './routes/productos.routes.js';
import routerCart from './routes/cart.routes.js';
import { __dirname } from './path.js';
import path from 'path';

import { ProductManager } from './controllers/productManager.js';

const productManager = new ProductManager('./src/models/productos.txt');

const PORT = 8080;
const app = express();

// Server
const server = app.listen(PORT, () => {
	console.log(`Servidor desde puerto: ${PORT}`);
	console.log(`http://localhost:${PORT}`);
});

const io = new Server(server);

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('handlebars', engine()); //defino que mi motor de plantillas va a ser handlebars
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));


// Conexión con socket.io

io.on('connection', socket => {
	console.log('Conexión con Socket.io');

	socket.on('load', async () => {
		const products = await productManager.getProducts();
		socket.emit('products', products);
	});

	socket.on('newProduct', async product => {
		await productManager.addProduct(product);
		const products = await productManager.getProducts();
		socket.emit('products', products);
	});

	socket.on('deleteProduct', async productId => {
		await productManager.deleteProduct(productId);
		const products = await productManager.getProducts();
		io.emit('products', products); // Emitir la lista actualizada a todos los clientes
	});
	
});

// Routes
app.use('/static', express.static(path.join(__dirname, '/public')));

app.get('/static', (req, res) => {
	res.render('index', {
		rutaCSS: 'index',
		rutaJS: 'index',
	});
});

app.get('/static/realtimeproducts', (req, res) => {
	res.render('realTimeProducts', {
		rutaCSS: 'realTimeProducts',
		rutaJS: 'realTimeProducts',
	});
});


// Routes
app.use('/api/products', routerProd);
app.use('/api/carts', routerCart);

app.use('/static', express.static(path.join(__dirname, '/public')));
app.get('*', (req, res) => {
    res.status(404).send('Error 404');
});




const mensajes = [];