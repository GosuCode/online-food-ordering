# QuickBite - Food Ordering Website

A comprehensive food delivery platform built with the MERN stack, featuring separate user and admin panels with real-time order management, dynamic pricing, demand forecasting, and secure payment processing.

## 🚀 Features

### User Panel

- **Authentication**: Secure JWT-based login/signup with validation
- **Menu Browsing**: Explore food categories with filtering options
- **Shopping Cart**: Add/remove items with quantity management
- **Order Placement**: Secure checkout with address validation
- **Order Tracking**: View order history and status
- **Responsive Design**: Mobile-first approach for all devices

### Admin Panel

- **Dashboard**: Analytics and order overview
- **Food Management**: Add, edit, and manage food items
- **Order Management**: Process and track customer orders
- **User Management**: View customer data and orders
- **Image Upload**: Easy food image management
- **Demand Forecasting**: 24-hour demand predictions with peak hour analysis
- **Dynamic Pricing**: Automated price adjustments based on demand, loyalty, and weather
- **Analytics**: Real-time demand levels and pricing insights

### Technical Features

- **JWT Authentication**: Secure user sessions
- **Password Hashing**: Bcrypt encryption
- **Stripe Integration**: Secure payment processing
- **RESTful APIs**: Well-structured backend endpoints
- **Role-based Access**: User and admin permissions
- **Form Validation**: Client and server-side validation
- **Toast Notifications**: User feedback system
- **Demand Forecasting**: Time series prediction algorithms
- **Dynamic Pricing**: Multi-factor rule-based pricing system
- **Real-time Analytics**: Live demand level monitoring

## 🛠️ Tech Stack

- **Frontend**: React, Vite, React Router, Context API
- **Admin Panel**: React, Vite, Recharts (Data Visualization)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe API
- **Styling**: CSS3 with responsive design
- **State Management**: React Context API
- **Analytics**: Custom forecasting and pricing algorithms

## 📦 Project Structure

```
Food-Delivery/
├── frontend/          # User-facing React application
├── admin/            # Admin panel React application
├── backend/          # Node.js/Express API server
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Stripe account for payments

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Food-Delivery
   cd Food-Delivery
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install Admin Dependencies**

   ```bash
   cd ../admin
   npm install
   ```

4. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

### Environment Setup

Create a `.env` file in the `backend` directory:

```env
JWT_SECRET=your_jwt_secret_key
SALT=your_bcrypt_salt_rounds
MONGO_URL=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Configuration

Update the following files with your backend URL:

1. **Frontend** (`frontend/src/context/StoreContext.jsx`):

   ```javascript
   const url = "http://localhost:4000";
   ```

2. **Admin** (`admin/src/App.jsx`):

   ```javascript
   const url = "http://localhost:4000";
   ```

3. **Backend** (`backend/controllers/orderController.js`):
   ```javascript
   const frontend_url = "http://localhost:3000";
   ```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend (User Panel)**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Start the Admin Panel**
   ```bash
   cd admin
   npm run dev
   ```

## 🌐 Access Points

- **User Application**: http://localhost:3000
- **Admin Panel**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 📱 Screenshots

### User Interface

- **Home Page**: Featured food items and categories
- **Menu Page**: Browse all available food items
- **Cart Page**: Review and modify your order
- **Order Page**: Secure checkout process
- **My Orders**: Track your order history

### Admin Interface

- **Dashboard**: Order analytics and overview
- **Food Management**: Add and manage menu items
- **Order Management**: Process customer orders
- **User Management**: View customer information
- **Forecast Dashboard**: 24-hour demand predictions with interactive charts
- **Pricing Management**: Dynamic pricing rules and demand-based adjustments
- **Analytics**: Real-time demand levels and peak hour analysis

## 🔧 API Endpoints

### Authentication

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/userData` - Get user data (protected)

### Food Management

- `GET /api/food/list` - Get all food items
- `POST /api/food/add` - Add new food item (admin)
- `POST /api/food/update` - Update food item (admin)
- `POST /api/food/remove` - Remove food item (admin)

### Order Management

- `POST /api/order/add` - Place new order
- `GET /api/order/list` - Get order list
- `POST /api/order/update` - Update order status (admin)

### Forecasting & Analytics

- `GET /api/forecast/summary` - Get forecast summary for all foods
- `GET /api/forecast/:id` - Get detailed forecast for specific food
- `GET /api/forecast/historical/:id` - Get historical demand data
- `GET /api/forecast/alerts` - Get forecast alerts
- `POST /api/forecast/generate` - Generate new forecasts

### Cart Management

- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/get` - Get cart items

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Role-based access control

## 🎨 Customization

### Adding New Food Categories

1. Update `frontend/src/assets/frontend_assets/assets.js`
2. Add category to `menu_list` array
3. Update food items with new category

### Forecasting Configuration

1. Modify demand patterns in `backend/scripts/seedData.js`
2. Adjust pricing rules in `backend/models/pricingModel.js`
3. Update weather impact factors in forecast generation

### Styling

- Modify CSS files in respective component directories
- Update color scheme in CSS variables
- Responsive breakpoints can be adjusted

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update API URLs to production endpoints

### Backend (Railway/Heroku)

1. Set environment variables
2. Deploy the backend folder
3. Update frontend API URLs

### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Update `MONGO_URL` in environment variables
3. Configure IP whitelist

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📊 Algorithm Documentation

For detailed information about the algorithms used in this project, see [ALGORITHMS.md](ALGORITHMS.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
