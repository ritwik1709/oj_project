import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import { judge } from '../utils/judge.js';

// Submit Code (Run or Submit)
export const submitCode = async (req, res) => {
  try {
    const { problemId, language, code, mode } = req.body;
    const userId = req.user.id;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Use sample test cases for run mode, full test cases for submit mode
    const testCases = mode === 'run' ? problem.sampleTestCases : problem.fullTestCases;

    console.log('Test Cases:', testCases); // Debug log

    // Judge the submission
    const result = await judge(code, language, testCases);
    console.log('Judge Result:', result); // Debug log

    // Save submission if it's not in run mode
    if (mode !== 'run') {
      const submission = new Submission({
        userId,
        problemId,
        language,
        code,
        verdict: result.verdict,
        resultOutput: result.error || result.got || '',
        submittedAt: new Date() // Explicitly set the date
      });

      console.log('Saving submission:', submission); // Debug log
      await submission.save();
    }

    res.status(200).json({
      message: `Code ${mode === 'run' ? 'executed' : 'submitted'} successfully`,
      ...result
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all submissions of a user
export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await Submission.find({ userId })
      .populate('problemId', 'title')
      .sort({ submittedAt: -1 });  // Sort by submittedAt in descending order
    
    // Format the dates before sending
    const formattedSubmissions = submissions.map(sub => ({
      ...sub.toObject(),
      submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null
    }));
    
    res.json(formattedSubmissions);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
