import bcrypt from 'bcrypt';
import importedUser from '../models/User.js';
import jwt from 'jsonwebtoken'


export const register = async (req, res) => {
  try {
    const { name, email, password, stdId, subject, semester,   } = req.body;

    // ✅ Check both email and student ID
    const existingUser = await importedUser.findOne({
      $or: [{ email }, { stdId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Hash password
       const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
    // const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Save ALL required fields
    const user = await importedUser.create({
      name,
      email,
      password: hash,
      stdId,
      subject,
      semester,
       
    });

    // ✅ Clean response (never send password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        stdId: user.stdId,
        subject: user.subject,
        semester: user.semester,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req,res)=>{
  const {email,password} = req.body;

  //check User if have
 try {
   const avilibleUser = await importedUser.findOne({email});
   if(!avilibleUser){
     return res.status(401).json({
       message:"Please Create An Account Frst",
       redirect:'/signup'
     })
   }
 
   //passwordMatching
    
   const isMatch = await bcrypt.compare(password.toString(),avilibleUser.password);
   if(!isMatch){
    return res.status(401).json({ message: 'Invalid Credentials' });
    }

   //create jwt token
   const token = jwt.sign(
     {
       id:avilibleUser._id,
        email:avilibleUser.email,
     },
    //  process.env.JWT_SECRET,
     'supersecretkey',
     {expiresIn:'1d'}
   );
 
   res.cookie('token',token,{
     httpOnly:true,
      sameSite:'strict',
     maxAge:24 * 60 * 60 * 1000,
   });
 
   res.status(200).json({
     message: 'Login successful',
     user: {
       id: avilibleUser._id,
       name: avilibleUser.name,
       email: avilibleUser.email,
       stdId: avilibleUser.stdId,
       subject: avilibleUser.subject,
       semester: avilibleUser.semester,
     },
   })

 } catch (error) {
   console.error(error);
   res.status(500).json({ message: 'Server error' });
 }
}

export const me = async (req,res) =>{
  try {
    const user = await importedUser.findById(req.user.id).select('-password');
    res.json({user});
  } catch (error) {
    res.status(500).json({Message:"error Occure while Me route"})
  }
}