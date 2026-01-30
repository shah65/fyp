import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    stdId: {
      type: String,
      required: true,
      unique: true,
    },

    subject: {
      type: String,
      required: true,
    },

    semester: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    project:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Project'
    }

    
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
