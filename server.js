require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose'), path = require('path');
const Service = require('./models/Service'), Project = require('./models/Project'), Client = require('./models/Client');
const app = express();
app.use(cors(), express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Public, non-private counts for the website statistics
app.get('/api/stats', async (req, res, next) => {
  try {
    const [clients, projects, completed] = await Promise.all([
      Client.countDocuments(), Project.countDocuments(), Project.countDocuments({ status: 'Completed' })]);
    res.json({ success: true, data: { clients, projects, completed } });
  } catch (e) { next(e); }
});
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

app.use((e, req, res, next) => {
  let code = 500, msg = 'Server error';
  if (e.name === 'CastError') { code = 400; msg = 'Invalid ID or value'; }
  else if (e.name === 'ValidationError') { code = 400; msg = Object.values(e.errors).map(x => x.message).join(', '); }
  else if (e.code === 11000) { code = 409; msg = 'Duplicate value'; }
  else if (e.type === 'entity.parse.failed') { code = 400; msg = 'Invalid JSON'; }
  else console.error(e);
  res.status(code).json({ success: false, message: msg });
});

// Adds sample services/projects the first time the database is empty
async function seed() {
  if (!(await Service.countDocuments())) {
    await Service.insertMany([
      ['Web Development', 'fa-code', 'Fast, modern and responsive websites.', 'Responsive design,SEO friendly,Clean code', '$500+'],
      ['UI/UX Design', 'fa-pen-ruler', 'Beautiful interfaces people enjoy using.', 'Wireframes,Prototypes,Design systems', '$300+'],
      ['Backend Development', 'fa-server', 'Secure, scalable APIs and server logic.', 'REST APIs,Authentication,Node.js & Express', '$600+'],
      ['Database Solutions', 'fa-database', 'Well-structured databases that scale.', 'MongoDB,Schema design,Backups', '$250+'],
      ['Mobile Application Development', 'fa-mobile-screen', 'Apps that work on phones and tablets.', 'Cross-platform,Offline support,App store help', '$900+'],
      ['Website Maintenance', 'fa-screwdriver-wrench', 'Keep your site fast, safe and updated.', 'Updates,Bug fixes,Monitoring', '$80/mo']
    ].map(([title, icon, description, f, price]) => ({ title, icon, description, features: f.split(','), price })));
  }
  if (!(await Project.countDocuments())) {
    await Project.insertMany([
      { title: 'Akash Cars', category: 'Web', status: 'Completed', description: 'Vehicle rental platform with booking and admin panel.', technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'MongoDB'] },
      { title: 'Online Quiz Application', category: 'Web', status: 'Completed', description: 'Education quiz app with timed tests and scoring.', technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js'] },
      { title: 'E-Commerce Website', category: 'Web', status: 'Active', description: 'Online store with cart, orders and payments.', technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'MongoDB'] }]);
  }
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('MongoDB connected');
  await seed();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Server running at http://localhost:' + port));
}).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
