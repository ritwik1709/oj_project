import { HfInference } from '@huggingface/inference';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAIFeedback = async (code, language, verdict, testCase) => {
    try {
        console.log('Starting AI Feedback Generation...');
        console.log('Environment check - HF_API_TOKEN exists:', !!process.env.HF_API_TOKEN);
        
        const client = new HfInference(process.env.HF_API_TOKEN);
        console.log('Hugging Face client initialized');
        
        const prompt = `You are a programming mentor. Analyze this code and provide ONLY a helpful hint (no explanations, no reasoning, no steps):

Language: ${language}
Verdict: ${verdict}
Failed Test Case:
Input: ${testCase.input}
Expected Output: ${testCase.expectedOutput}
Actual Output: ${testCase.output}

Code:
${code}

Provide a single, concise hint that points out what might be wrong and suggests a direction without revealing the solution.`;

        console.log('Sending request to Hugging Face API...');
        const response = await client.textGeneration({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            inputs: prompt,
            parameters: {
                max_new_tokens: 150,
                temperature: 0.7,
                top_p: 0.95,
                repetition_penalty: 1.1
            }
        });
        
        console.log('Received response from Hugging Face API');
        if (!response.generated_text) {
            throw new Error('No content in the response');
        }

        // Clean up the response
        let hint = response.generated_text
            // Remove the prompt if it was included in the response
            .replace(/You are a programming mentor.*?Code:[\s\S]*?Provide a single, concise hint that/g, '')
            // Remove any markdown formatting
            .replace(/\*\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/---/g, '')
            // Remove any "Hint:" or similar prefixes
            .replace(/^(Hint|Suggestion|Advice):\s*/i, '')
            // Remove any step-by-step sections
            .replace(/\n## Step.*$/s, '')
            // Trim whitespace and newlines
            .trim()
            // Remove any trailing periods
            .replace(/\.+$/, '')
            // Add a single period at the end
            + '.';

        // If the hint is too long, truncate it
        if (hint.length > 200) {
            hint = hint.substring(0, 197) + '...';
        }
        
        return hint;
    } catch (error) {
        console.error('AI Feedback Error Details:', {
            message: error.message,
            name: error.name,
            status: error.status,
            statusText: error.statusText
        });
        
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
