# GiftLink Backend API

Express.js + MongoDB backend for GiftLink e-commerce platform.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your MongoDB connection in .env
MONGO_URI=your_mongodb_connection_string
DB_NAME=giftlink
JWT_SECRET=your_secret_key
PORT=8080

# Run development server
npm run dev
```

### Production Deployment (Render)

1. **Push code to GitHub**
2. **Connect Render to your repository**
3. **Configure Environment Variables in Render Dashboard:**
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `DB_NAME`: giftlink
   - `JWT_SECRET`: Generate a secure random string
   - `NODE_ENV`: production
   - `PORT`: 10000 (automatically set by Render)

4. **Deploy** - Render will use `render.yaml` configuration

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /` - API info

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token

### Gifts
- `GET /api/gifts` - Get all gifts
- `GET /api/gifts/:id` - Get gift by ID

### Search
- `GET /api/search?category=electronics` - Search gifts by category

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `PORT` | Server port (default: 8080) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🏗️ Project Structure

```
giftlink-backend/
├── models/
│   └── db.js              # MongoDB connection
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   ├── giftRoutes.js      # Gift CRUD operations
│   └── searchRoutes.js    # Search functionality
├── app.js                 # Express app configuration
├── package.json           # Dependencies
├── render.yaml            # Render deployment config
└── .env                   # Environment variables (not committed)
```

## 🐛 Troubleshooting

### 502 Bad Gateway
- Check Render logs for errors
- Verify `MONGO_URI` is correct in Render environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### CORS Errors
- Frontend origin must be whitelisted in `app.js`
- Check that preflight OPTIONS requests are allowed

### Database Connection Fails
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas
- Verify connection string format

## 📦 Dependencies

- **express**: Web framework
- **mongodb**: MongoDB driver
- **jsonwebtoken**: JWT authentication
- **cors**: CORS middleware
- **dotenv**: Environment variable management
- **natural**: Sentiment analysis (planned)

## 🔒 Security Notes

⚠️ **Warning**: This is a demonstration project. For production:
- Implement password hashing (bcrypt)
- Add rate limiting
- Add request validation
- Add authentication middleware for protected routes
- Use helmet for security headers
- Implement proper logging
- Add monitoring and alerting

## 📄 License

ISC
