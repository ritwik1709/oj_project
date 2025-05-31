import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import { judge } from '../utils/judge.js';
import { generateAIFeedback } from '../utils/aiFeedback.js';

// Submit Code (Run or Submit)
export const submitCode = async (req, res) => {
  try {
    const { problemId, language, code, mode } = req.body;
    const userId = req.user.id;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Ensure test cases exist and are not empty
    const testCases = mode === 'run' ? problem.sampleTestCases : problem.fullTestCases;
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ message: 'No test cases available' });
    }

    console.log('Test Cases:', testCases); // Debug log

    // Judge the submission
    const result = await judge(code, language, testCases);
    
    // Generate AI feedback if verdict is not Accepted
    let aiFeedback = null;
    if (result.verdict !== 'Accepted' && mode !== 'run') {
      const failedTestCase = testCases[result.failedTestCase - 1];
      if (failedTestCase) {
        const testCaseWithOutput = {
          input: failedTestCase.input,
          expectedOutput: failedTestCase.output,
          output: result.got || result.error || ''
        };
        aiFeedback = await generateAIFeedback(code, language, result.verdict, testCaseWithOutput);
      }
    }

    // Save submission if it's not in run mode
    if (mode !== 'run') {
      const submission = new Submission({
        userId,
        problemId,
        language,
        code,
        verdict: result.verdict,
        aiFeedback,
        resultOutput: result.error || result.got || '',
        submittedAt: new Date()
      });

      console.log('Saving submission:', submission);
      await submission.save();
    }

    res.status(200).json({
      message: `Code ${mode === 'run' ? 'executed' : 'submitted'} successfully`,
      ...result,
      aiFeedback
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
      .select('+code') // Explicitly include the code field
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
