# E-Commerce Backend Restructure Summary

## Project Structure

The project has been reorganized from a microservices-per-folder approach to a centralized architecture:

### Old Structure
```
user-service/
  - index.js
  - routes/user.js
  - models/user.js
product-service/
  - index.js
  - routes/product.js
  - models/product.js
... (etc for other services)
```

### New Structure
```
app.js                           # Main application entry point
package.json                     # Unified dependencies
.env.example                     # Environment template

models/                          # All database models
  - User.js
  - Product.js
  - Order.js
  - Payment.js
  - Cart.js

controllers/                     # Business logic for each service
  - userController.js
  - productController.js
  - orderController.js
  - paymentController.js
  - cartController.js
  - notificationController.js

routes/                          # Routes for each service
  - userRoutes.js
  - productRoutes.js
  - orderRoutes.js
  - paymentRoutes.js
  - cartRoutes.js
  - notificationRoutes.js
```

## Key Benefits

1. **Single Entry Point**: One `app.js` manages all services
2. **Centralized Database**: All models in one `models/` folder
3. **Clean Separation**: Controllers and routes are organized by feature
4. **Easy Maintenance**: Changes to one service don't affect folder structure
5. **Unified Dependencies**: Single `package.json` for all services

## How to Use

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` file from template
```bash
cp .env.example .env
```

### 3. Update `.env` with your configuration
- MongoDB connection string
- JWT secret
- Port number (default: 5000)

### 4. Run the application
```bash
npm start        # Production
npm run dev      # Development (with auto-reload)
```

## API Endpoints

All endpoints are now under one base URL: `http://localhost:5000/api/`

### User Service
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Product Service
- `POST /api/products/create` - Create product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/deduct` - Deduct stock

### Order Service
- `POST /api/orders/:userId` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/user/:userId` - Get user's orders
- `GET /api/orders/user/:userId/:orderId` - Get specific order
- `PUT /api/orders/:orderId/status` - Update order status

### Payment Service
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/user/:userId` - Get user's payments
- `PUT /api/payments/:id/status` - Update payment status

### Cart Service
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart/:userId` - Add item to cart
- `DELETE /api/cart/:userId/:productId` - Remove item from cart
- `PUT /api/cart/:userId/:productId` - Update item quantity
- `DELETE /api/cart/:userId` - Clear cart

### Notification Service
- `POST /api/notification/send` - Send notification
- `POST /api/notification/order-confirmation` - Send order confirmation
- `POST /api/notification/order-status` - Send order status update
- `POST /api/notification/payment-confirmation` - Send payment confirmation

## Migration Notes

- All old service folders (user-service, product-service, etc.) can be removed
- Update any external services pointing to individual service ports to use the main `app.js` on port 5000
- Database connection is now centralized with all models using the same MongoDB connection

## Development Tips

- Use `npm run dev` during development for auto-reload
- Check logs to verify all services are connected
- All models include timestamps for tracking changes
- Error handling is consistent across all controllers
