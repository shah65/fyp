import jwt from "jsonwebtoken";
import User from '../models/User.js'

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
  
    if (!token){
      return res.status(401).json({ message: "Not authenticated" });   
    }
    const decoded = jwt.verify(token, "supersecretkey");
     
    const user = await User.findById(decoded.id).select('-password');
    if(!user){
      return res.status(401).json({message:"User not found!"});
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    res.status(401).json({message:"Invalid Token"});
  }
};

export default authMiddleware;
