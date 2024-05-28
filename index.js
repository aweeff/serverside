const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://zero:asdfghjkl@cluster0.kruubwe.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address :{type: String, required: true},
  phone: {type: String, required:true},
  name:{ type: String, required: true },
});

const User = mongoose.model('User', userSchema);



// Registration Route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      phone:"change me",
      address:"change me",
      name:"change me"
    });

    await newUser.save();

    res.status(201).json({ newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json(user);
    console.log(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
  
  // Middleware
  app.use(bodyParser.json());
  
  // Get User Profile Route
app.get('api/fetchProfile', async (req, res) => {
  const { email } = req.query; // Assume we're passing the email as a query parameter

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    console.log('Error fetching user profile:', error);
    res.status(500).send({ message: 'Failed to fetch user profile' });
  }
});
  
  // Update User Profile Route
  app.post('/api/update', async (req, res) => {
    const { mainmail, name, email, phone, address } = req.body;

    try {
      // Find the user by the original email and update their profile
      const updatedUser = await User.findOneAndUpdate(
          { email: mainmail }, // Find by original email
          { name, email, phone, address }, // New values to set
          { new: true } // Option to return the updated document
      );

      if (!updatedUser) {
        return res.status(404).send({ message: 'User not found' });
      }

      res.send(updatedUser);
    } catch (error) {
      console.log('Error updating user profile:', error);
      res.status(500).send({ message: 'Failed to update user profile' });
    }
  });



// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
