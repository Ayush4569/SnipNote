import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './env';
import { connectDB } from './database/db';
import authRoutes from './routes/auth.route';
import { errorHandler } from './utils/apiError';
const app = express();


// Connect to the database
connectDB(config.DATABASE_URL);

// Middlewares
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// Sample route
app.get('/', (req: Request, res: Response) => {
    res.send('Snipnote Backend is running!');
});
app.get('/api/auth',authRoutes)




app.use(errorHandler)
// Start the server
app.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
});

