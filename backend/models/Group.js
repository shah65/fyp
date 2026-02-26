import mongoose from 'mongoose';


const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rollNumber:{
    type:Number,
    unique:true,
    required:true
  },
  role:{
    type:String,
    enum:['co-ordinator','member','leader'],
    required:true,
    default:'member'
  },
  image:{
    type:String,
    default:null
  },
  createdAt:{
    type:Date,
    default:Date.now()
  },
});

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
   },

  description: {
    type: String,
  },

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  members: [memberSchema]

}, { timestamps: true });
export default mongoose.model("Group", groupSchema);
 