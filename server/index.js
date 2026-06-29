import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

// Health check
app.get('/api', (req, res) => res.json({ status: 'BeliefSystems API running ✅' }))

app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
})