import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server successfully connected on http://localhost:${PORT}`);
    
})

//http://localhost:5000/api/users