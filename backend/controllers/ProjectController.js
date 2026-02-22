import Project from '../models/ProjectModel.js'
import group from '../models/Group.js'
export const uploadProject = async(req,res) =>{
  try {

    const existenceProject = await Project.findOne({student: req.user._id});
    if(existenceProject){
      return res.status(400).json({
        success:false,
        message: "PROJECT ALREADY UPLOADED.",
        
      })
    }
    const { title, technology, supervisor } = req.body;
    
    
    if(!req.file){
      return res.status(400).json({message:"File is required"})
    }
    const project = await Project.create({
      title,
      technology,
      supervisor,
      document:req.file.path,
      student:req.user._id, // coming from  JWT;
    });
    // 🔥 CREATE GROUP AUTOMATICALLY HERE
    await group.create({
      groupName: title,
      description: title,
      leader: req.user._id,
      supervisor: supervisor,
      members: []
    });


    res.status(201).json({
      success:true,
      message:"Project Uploaded Succfully",
      project,
     
    })
    
  } catch (error) {
    console.error("🔥 UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
 
  }
}

export const getProject = async (req,res) =>{
  try {
    //const userId = req.user.id;
    const project = await Project.findOne( {
      student:req.user._id
    });
    if(!project){
      return res.status(404).json({message:"Project not found!"});
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({message:"Server Error While Fetching Project"})
  }
}