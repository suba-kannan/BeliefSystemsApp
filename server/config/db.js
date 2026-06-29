import mongoose from "mongoose";

const connectDB = async()=>{
    try {

        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database successfully connected on ${conn.connection.host}`);
        
        
    } catch (error) {
        console.log("Error",error);
        process.exit(0)
        
    }
}

export default connectDB