// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from environment variables if available

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("MongoDB connection string is missing in .env file");
  process.exit(1); // Exit the application if connection string is missing
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define the schema
const jobSchema = new mongoose.Schema({
  jobDesc: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  salary: { type: Number, required: true },
});

// Create a model
const Job = mongoose.model("Job", jobSchema);

// Route to accept data from the frontend
app.post("/jobs", async (req, res) => {
  try {
    const { jobDesc, email, salary } = req.body;

    // Create a new job entry
    const newJob = new Job({
      jobDesc,
      email,
      salary,
    });

    await newJob.save();
    res.status(201).json({ message: "Job created successfully", data: newJob });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to get all jobs
app.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to delete a job by ID
app.delete("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully", data: deletedJob });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
