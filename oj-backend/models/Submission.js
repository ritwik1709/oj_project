import mongoose from "mongoose"

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },

  language: {
    type: String,
    enum: ['cpp', 'java', 'javascript'],
    required: true,
  },

  code: {
    type: String,
    required: true,
  },

  verdict: {
    type: String, // e.g., Accepted, WA, TLE, etc.
    required: true,
  },

  resultOutput: {
    type: String,
  },
  aiFeedback: {
    type: String,
    default: null
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,  // This will add createdAt and updatedAt fields
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      if (ret.submittedAt) {
        ret.submittedAt = new Date(ret.submittedAt).toISOString();
      }
      return ret;
    }
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
