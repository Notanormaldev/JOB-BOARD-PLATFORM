const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Notification = require('./models/Notification');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job-board-platform';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Notification.deleteMany();
    console.log('Existing collections cleared.');

    // Passwords hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@hirehub.com',
      password: hashedPassword,
      role: 'admin',
    });

    const employer = await User.create({
      name: 'Sarah Jenkins',
      email: 'employer@acme.com',
      password: hashedPassword,
      role: 'employer',
      employerProfile: {
        companyName: 'Acme Software Corp',
        companyWebsite: 'https://acmesoftware.io',
        companyBio: 'Acme Software builds cutting-edge SaaS products for enterprise communication and collaboration. We are a remote-first company with 200+ employees globally.',
      },
    });

    const candidate = await User.create({
      name: 'John Doe',
      email: 'candidate@hirehub.com',
      password: hashedPassword,
      role: 'candidate',
      candidateProfile: {
        title: 'Full Stack Engineer',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TailwindCSS'],
        bio: 'Passionate software developer with 3+ years of experience building responsive web applications. Enthusiastic about MERN stack and clean code.',
        resumeUrl: '/uploads/sample-resume.pdf',
      },
    });

    console.log('Users created:');
    console.log(' - Admin: admin@hirehub.com / password123');
    console.log(' - Employer: employer@acme.com / password123');
    console.log(' - Candidate: candidate@hirehub.com / password123');

    // Create Jobs
    const job1 = await Job.create({
      title: 'Senior React Developer',
      company: 'Acme Software Corp',
      employer: employer._id,
      location: 'Remote',
      type: 'Full-time',
      experienceLevel: 'Senior',
      salary: '$120k - $140k',
      description: 'We are seeking a Senior React Developer to lead the development of our enterprise dashboard modules. You will collaborate closely with product design teams to build high-performance components.',
      requirements: [
        '5+ years of production experience with JavaScript/React',
        'Strong proficiency in TypeScript, Redux, and modern build tools',
        'Experience building accessible (WCAG) component libraries',
        'Familiarity with TailwindCSS or Styled Components'
      ],
      status: 'active',
    });

    const job2 = await Job.create({
      title: 'Backend Node.js Engineer',
      company: 'Acme Software Corp',
      employer: employer._id,
      location: 'New York, NY (Hybrid)',
      type: 'Full-time',
      experienceLevel: 'Mid',
      salary: '$95k - $115k',
      description: 'Join our core platform group to scale REST APIs and microservices. You will work on database optimization, secure user sessions, and third-party API integrations.',
      requirements: [
        '3+ years experience writing server-side APIs in Node.js',
        'Solid experience with MongoDB, Express, and SQL databases',
        'Familiarity with Docker and AWS ecosystem',
        'Strong knowledge of JWT and OAuth auth flows'
      ],
      status: 'active',
    });

    const job3 = await Job.create({
      title: 'Product Design Intern',
      company: 'Acme Software Corp',
      employer: employer._id,
      location: 'Remote',
      type: 'Internship',
      experienceLevel: 'Entry',
      salary: '$25 - $35 / hour',
      description: 'Looking for a passionate UX/UI Design student to support our layout designs. You will work directly with our design lead on user research and building Figma prototypes.',
      requirements: [
        'Basic portfolio showcasing mobile or web application layouts',
        'Good understanding of design systems and typography',
        'Proficiency in Figma and Adobe Creative Suite',
        'Strong communication skills and willingness to learn'
      ],
      status: 'active',
    });

    console.log('Job listings created.');

    // Create Application
    const app = await Application.create({
      job: job1._id,
      candidate: candidate._id,
      resumeUrl: '/uploads/sample-resume.pdf',
      coverLetter: 'I am thrilled to apply for the Senior React Developer role. Having worked extensively with React and Tailwind for the last 3 years, I am confident I can contribute to Acme Software Corp dashboard products immediately.',
      status: 'applied',
    });

    // Create Notification
    await Notification.create({
      recipient: employer._id,
      sender: candidate._id,
      type: 'new_application',
      message: 'John Doe applied for your job listing: "Senior React Developer"',
    });

    console.log('Applications and notifications seeded.');

    // Create a mock sample resume file in uploads directory to prevent error when trying to view it
    const uploadsDir = './uploads';
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    fs.writeFileSync(`${uploadsDir}/sample-resume.pdf`, 'This is a mock PDF resume seeded for John Doe.');

    console.log('Seeder completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
