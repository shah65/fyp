import mongoose from 'mongoose';
 
const connectionDB = async () =>{
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/fypBD');
    console.log(`MongoDB connected successfully: ${conn.connection.host}`)
    console.log("-------> DataBase is Ready<------");
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
    
    
  }
}

export default connectionDB;