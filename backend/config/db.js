/*import mongoose from "mongoose";
export const connectDB = async () =>{
    
    await mongoose.connect('mongodb+srv://sharvarii02:Kothrud38@cluster0.zapd9us.mongodb.net/TaskManager')
    .then(()=> console.log('DB connected'));
}*/
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://sharvarii02:Kothrud38@cluster0.zapd9us.mongodb.net/TaskManager",
      {
        serverSelectionTimeoutMS: 5000, // avoid hanging forever
        tls: true, // enforce TLS
      }
    );
    console.log("✅ DB connected");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};
