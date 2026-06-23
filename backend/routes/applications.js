const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Setup multer directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
      return cb(new Error('Only PDFs and Word documents are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/applications
// @desc    Apply for a job (Candidate only)
// @access  Private (Candidate)
router.post('/', protect, authorize('candidate'), (req, res) => {
  upload.single('resume')(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { jobId, coverLetter, useProfileResume } = req.body;

    try {
      const job = await Job.findById(jobId).populate('employer');
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (job.status !== 'active') {
        return res.status(400).json({ message: 'This job listing is no longer active' });
      }

      // Check if already applied
      const alreadyApplied = await Application.findOne({
        job: jobId,
        candidate: req.user._id,
      });

      if (alreadyApplied) {
        return res.status(400).json({ message: 'You have already applied for this job' });
      }

      let resumeUrl = '';
      if (req.file) {
        // We will store the path or file name.
        resumeUrl = `/uploads/${req.file.filename}`;
      } else if (useProfileResume === 'true' && req.user.candidateProfile && req.user.candidateProfile.resumeUrl) {
        resumeUrl = req.user.candidateProfile.resumeUrl;
      } else {
        return res.status(400).json({ message: 'Please upload a resume or select your profile resume' });
      }

      const application = await Application.create({
        job: jobId,
        candidate: req.user._id,
        resumeUrl,
        coverLetter,
      });

      // Notify the employer
      await Notification.create({
        recipient: job.employer._id,
        sender: req.user._id,
        type: 'new_application',
        message: `${req.user.name} applied for your job listing: "${job.title}"`,
      });

      res.status(201).json(application);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

// @route   GET /api/applications
// @desc    Get applications based on user role
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'candidate') {
      // Candidates see their own applications
      applications = await Application.find({ candidate: req.user._id })
        .populate({
          path: 'job',
          populate: { path: 'employer', select: 'name email employerProfile' }
        })
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'employer') {
      // Employers see applications for their posted jobs
      const jobs = await Job.find({ employer: req.user._id });
      const jobIds = jobs.map(job => job._id);

      applications = await Application.find({ job: { $in: jobIds } })
        .populate('job')
        .populate('candidate', 'name email candidateProfile')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'admin') {
      // Admins see all
      applications = await Application.find()
        .populate('job')
        .populate('candidate', 'name email candidateProfile')
        .sort({ createdAt: -1 });
    }

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update application status (Employer/Admin only)
// @access  Private (Employer/Admin)
router.put('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify employer owns the job or admin
    if (application.job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Notify the candidate
    await Notification.create({
      recipient: application.candidate._id,
      sender: req.user._id,
      type: 'status_change',
      message: `Your application status for "${application.job.title}" has been updated to "${status}".`,
    });

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
