import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './env'
import { connectDB } from './database/db'
import authRoutes from './routes/auth.route'
import summaryRoutes from './routes/summary.route'
import { webHookRouter, subscriptionRoutes } from './routes/subscription.route'
import { errorHandler } from './utils/apiError'

const app = express()

connectDB(config.DATABASE_URL)

app.use(cors({
  origin: ['http://localhost:3000','https://snipnote-v1.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use('/api/subscriptions/webhook', webHookRouter)

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => {
  res.send('Snipnote Backend is running!')
})

app.use('/api/auth', authRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

app.use(errorHandler)

app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`)
})
