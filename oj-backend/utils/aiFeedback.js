import { HfInference } from '@huggingface/inference';

export const generateAIFeedback = async (code, language, verdict, testCase) => {
    try {
        const client = new HfInference(process.env.HF_API_TOKEN);
        
        const prompt = `
        You are a programming mentor.
        
        A student wrote some code that failed a test case. 
        Your task is to give **only a helpful hint** — not a solution.
        
        The hint should:
        - Point out what might be wrong
        - Suggest what to check
        - Give general direction, **without revealing how to fix it**
        
        Avoid detailed steps or exact code.
        
        --- Student Submission ---
        Language: ${language}
        Verdict: ${verdict}
        
        Failed Test Case:
        Input: ${testCase.input}
        Expected Output: ${testCase.expectedOutput}
        Actual Output: ${testCase.output}
        
        Code:
        ${code}
        
        --- Your Hint ---
        `;
        
// const prompt = `You are a helpful programming mentor. 
// Provide a helpful hint for a student's code submission that failed on a test case. 
// Do NOT provide a full solution. Instead:
// 1. Point out what might be wrong.
// 2. Suggest what to check.
// 3. Give general direction, focusing on the specific issue.

// Now analyze the following:
// Language: ${language}
// Verdict: ${verdict}
// Failed Test Case:
// Input: ${testCase.input}
// Expected Output: ${testCase.expectedOutput}
// Actual Output: ${testCase.output}

// Code:
// ${code}
// `;
        const response = await client.textGeneration({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            inputs: prompt,
            parameters: {
                max_new_tokens: 250,
                temperature: 0.5,
                top_p: 0.95,
                repetition_penalty: 1.1
            }
        });
        
        return response.generated_text;
    } catch (error) {
        console.error('AI Feedback Error:', error);
        // Provide more specific fallback messages based on the verdict
        switch (verdict) {
            case 'Wrong Answer':
                return "Check your logic for handling edge cases and verify your output format matches exactly what's expected.";
            case 'Time Limit Exceeded':
                return "Your solution might be using an inefficient algorithm. Consider optimizing your approach or using a more efficient data structure.";
            case 'Runtime Error':
                return "Look for potential null pointer dereferences, array index out of bounds, or division by zero in your code.";
            default:
                return "Review your code logic and ensure it handles all possible input cases correctly.";
        }
    }
};
