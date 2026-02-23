import express from 'express'
import cors from 'cors'
import fs from 'fs'
import cookieParser from 'cookie-parser'
import morgan from "morgan"
import { config } from './env'
import { connectDB } from './database/db'
import authRoutes from './routes/auth.route'
import summaryRoutes from './routes/summary.route'
import { webHookRouter, subscriptionRoutes } from './routes/subscription.route'
import { CustomError, errorHandler } from './utils/apiError'
import path from 'path'

const app = express()
const logDir = path.resolve(process.cwd(), 'logs')

fs.mkdirSync(logDir, { recursive: true })
const logStream = fs.createWriteStream('./logs/access.log', { flags: 'a' })


connectDB(config.DATABASE_URL)
app.use(
  morgan(
    (tokens, req, res) => {
      return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseTime: tokens['response-time'](req, res) + ' ms',
        date: new Date().toISOString(),
      })
    },
    { stream: logStream }
  )
)
app.use(cors({
  origin: ['http://localhost:3000', 'https://snipnote-v1.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// app.use(logger)

app.use('/api/subscriptions/webhook', webHookRouter)

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))


app.get('/', (_, res) => {
  return res.status(200).send('Snipnote Backend is running!')
})
app.get("/error", (req, res) => {
  throw new CustomError(500,"Testing the error")
});

app.use('/api/auth', authRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

app.use(errorHandler)



app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`)
})
