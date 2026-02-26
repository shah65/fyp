const authorizeTeacher = (req,res,next) => {
  if(req.userRole !== 'teacher'){
    return res.status(403).json({
      message:"Access Denied. Teachers only."
    })
  }
  next();
}

export default authorizeTeacher;