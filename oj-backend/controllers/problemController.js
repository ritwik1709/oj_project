import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';

// Get all problems (public)
export const getAllProblems = async (req, res) => {
  try {
    // First get all problems
    const problems = await Problem.find().select('title difficulty');
    
    // Get submission counts for each problem
    const submissionCounts = await Submission.aggregate([
      {
        $group: {
          _id: '$problemId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of problem ID to submission count
    const submissionCountMap = {};
    submissionCounts.forEach(item => {
      submissionCountMap[item._id.toString()] = item.count;
    });

    // Add submission counts to problems
    const problemsWithCounts = problems.map(problem => ({
      ...problem.toObject(),
      submissions: submissionCountMap[problem._id.toString()] || 0
    }));

    res.json(problemsWithCounts);
  } catch (err) {
    console.error('Get all problems error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single problem by ID (public)
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new problem (admin only)
export const createProblem = async (req, res) => {
  try {
    console.log('Create Problem - Request user:', req.user);
    console.log('Create Problem - Request body:', req.body);
    
    const { title, description, difficulty, sampleTestCases, fullTestCases } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      console.log('Create Problem - Missing required fields');
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Validate test cases
    if (!Array.isArray(sampleTestCases) || !Array.isArray(fullTestCases)) {
      console.log('Create Problem - Invalid test case format');
      return res.status(400).json({ message: 'Sample and full test cases must be arrays' });
    }

    // Validate test case format
    const validateTestCases = (testCases) => {
      return testCases.every(tc => tc.input !== undefined && tc.output !== undefined);
    };

    if (!validateTestCases(sampleTestCases) || !validateTestCases(fullTestCases)) {
      console.log('Create Problem - Invalid test case data');
      return res.status(400).json({ message: 'All test cases must have input and output fields' });
    }

    const problem = new Problem({ 
      title, 
      description, 
      difficulty, 
      sampleTestCases, 
      fullTestCases,
      createdBy: req.user.id // Add the user who created the problem
    });

    console.log('Create Problem - Saving problem:', problem);
    await problem.save();
    console.log('Create Problem - Problem saved successfully');
    
    res.status(201).json({ 
      message: 'Problem created successfully', 
      problem: {
        id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty
      }
    });
  } catch (err) {
    console.error('Create Problem - Error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update problem (admin only)
export const updateProblem = async (req, res) => {
  try {
    const updated = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete problem (admin only)
export const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
