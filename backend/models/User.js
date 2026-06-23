const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  role: {
    type: String,
    enum: ['candidate', 'employer', 'admin'],
    default: 'candidate',
  },
  candidateProfile: {
    title: { type: String, default: '' },
    skills: { type: [String], default: [] },
    resumeUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  employerProfile: {
    companyName: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    companyBio: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
