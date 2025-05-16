import User from '../models/User.js';
import Submission from '../models/Submission.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ userId: req.params.id }); // clean up
    res.json({ message: 'User and submissions deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all submissions (with optional filtering)
export const getAllSubmissions = async (req, res) => {
  try {
    const { userId, problemId } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (problemId) query.problemId = problemId;

    const submissions = await Submission.find(query)
      .populate('userId', 'username')
      .populate('problemId', 'title');

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a submission
export const deleteSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
