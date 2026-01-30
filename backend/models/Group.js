import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  name:String,
  rollNumber:{
    type:Number,
    unique:true,
    required:true
  },
  role:{
    type:String,
    enum:['leader','co-ordinator','member'],
    required:true
  },
  description:String,
  image:String,
  createdSt:{
    type:Date,
    default:Date.now()
  },
});


const groupSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  members: [memberSchema]
}, { timestamps: true });

export default mongoose.model("Group", groupSchema);