import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const dynamicUri = process.env.MONGODB_URI || "";

    const connectionInstance = await mongoose.connect(dynamicUri);
    console.log(` 📂 Database Name: ${connectionInstance.connection.name}`);
    console.log(` 🏠 DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1); // Exit the process with failure
  }
};
export default connectDB;
