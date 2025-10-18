import mongoose from "mongoose";
const connectDB = async(DATABASE_URL:string)=>{
    try {
        const connectionInstance = await mongoose.connect(DATABASE_URL)
        console.log("Database connected successfully",connectionInstance.connection.name);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

export {
    connectDB
}