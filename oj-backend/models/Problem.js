import mongoose from "mongoose"

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true,
        trim: true
    },
    output: {
        type: String,
        required: true,
        trim: true
    }
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy',
    },

    sampleTestCases: {
        type: [testCaseSchema],
        required: true,
        validate: [array => array.length > 0, 'At least one sample test case is required']
    },

    fullTestCases: {
        type: [testCaseSchema],
        required: true,
        validate: [array => array.length > 0, 'At least one full test case is required']
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true 
});

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;


