import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'authorType' // Dynamic referencing
  },
  authorType: {
    type: String,
    required: true,
    enum: ['User', 'Teacher'] // Can be either User or Teacher
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

feedbackSchema.index({ project: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;