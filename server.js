/**
 * Amazon-Grade Enterprise E-Commerce Server & Live Broadcast Engine
 * Features: Multi-Tier Caching (Redis), Edge CDN Cache Invalidation Hooks,
 * Real-Time WebSocket Publishing, and REST API for Catalog Management.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH']
  }
});

// Configure Redis Client (Fallback to Mock Mode if Redis Server unavailable locally)
let redis;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });
  redis.on('error', (err) => console.warn('[Redis] Connection Warning: Running in degraded mode.', err.message));
} catch (e) {
  console.warn('[Redis] Operating with in-memory fallback.');
}

app.use(express.json());

// In-Memory Catalog Store (Demonstration / Fallback Cache Layer)
const mockProducts = [
  { id: 'p1', sku: 'LED-001', title: 'RGB LED Strip Light', category: 'lighting', price: 2999, discount_price: 1999, stock: 45, rating: 4.8, images: ['https://foyr.com/learn/wp-content/uploads/2019/01/lighting-for-gaming-room-scaled.jpg'] },
  { id: 'p2', sku: 'DESK-002', title: 'Ergonomic Gaming Desk', category: 'furniture', price: 8999, discount_price: 6999, stock: 8, rating: 4.9, images: ['https://cdn.shopify.com/s/files/1/1881/2599/files/0d554ee22af77852eabae82936cee6ee_480x480.jpg?v=1717754907'] },
  { id: 'p3', sku: 'PANEL-003', title: 'Acoustic Wall Panels', category: 'furniture', price: 1899, discount_price: 1499, stock: 24, rating: 4.6, images: ['https://m.media-amazon.com/images/I/815NKi8l4kL._UF1000,1000_QL80_.jpg'] },
  { id: 'p4', sku: 'CHAIR-004', title: 'Cyberpunk Pro Chair', category: 'furniture', price: 14999, discount_price: 10999, stock: 3, rating: 4.9, images: ['https://foyr.com/learn/wp-content/uploads/2019/01/seating-for-gaming-room.jpg'] }
];

/**
 * Multi-Tier Caching Helper
 * Level 1: In-Memory / Redis
 * Level 2: CDN Edge Invalidation Trigger
 */
async function invalidateProductCache(productId) {
  const cacheKey = `product:${productId}`;
  if (redis && redis.status === 'ready') {
    await redis.del(cacheKey);
    await redis.del('products:all');
  }
  // CDN Cache Invalidation Webhook Simulation (e.g., Cloudflare API)
  console.log(`[Edge Cache] Cleared CDN edge cache tag for product:${productId}`);
}

// REST API: Fetch All Products (Sub-100ms Optimized Lookup)
app.get('/api/products', async (req, res) => {
  const startTime = Date.now();
  if (redis && redis.status === 'ready') {
    const cached = await redis.get('products:all');
    if (cached) {
      return res.json({
        source: 'redis_cache',
        execution_time_ms: Date.now() - startTime,
        data: JSON.parse(cached)
      });
    }
  }

  // Fallback to Primary DB read
  const data = mockProducts;
  if (redis && redis.status === 'ready') {
    await redis.set('products:all', JSON.stringify(data), 'EX', 3600);
  }

  return res.json({
    source: 'primary_db',
    execution_time_ms: Date.now() - startTime,
    data
  });
});

// REST API: Live Admin Product Update & WebSockets Broadcaster
app.patch('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const { price, stock, title, category } = req.body;

  const product = mockProducts.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const oldPrice = product.price;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (title !== undefined) product.title = title;
  if (category !== undefined) product.category = category;

  // 1. Invalidate Cache
  await invalidateProductCache(id);

  // 2. Broadcast Live Update to all active visitor WebSocket clients
  const payload = {
    productId: id,
    product: { ...product },
    oldPrice,
    newPrice: product.price,
    timestamp: Date.now()
  };

  io.emit('PRODUCT_PRICE_UPDATED', payload);

  return res.json({
    success: true,
    message: 'Product updated globally and broadcast to live clients.',
    payload
  });
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  socket.on('join_product_room', (productId) => {
    socket.join(`product_${productId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Cryo_BYTE Amazon-Grade Engine running on port ${PORT}`);
  console.log(`⚡ WebSocket Server & Live Publisher Ready`);
  console.log(`=======================================================`);
});
