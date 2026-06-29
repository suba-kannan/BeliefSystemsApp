import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    required: true,
    enum: ['teacher', 'hod', 'principal'],
  }
}, { timestamps: true });

const Update = mongoose.model('Update', updateSchema);
export default Update;
