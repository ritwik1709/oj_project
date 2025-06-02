import { InferenceClient } from '@huggingface/inference';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAIFeedback = async (code, language, verdict, testCase) => {
    try {
        console.log('Starting AI Feedback Generation...');
        console.log('Environment check - HF_API_TOKEN exists:', !!process.env.HF_API_TOKEN);
        
        const client = new InferenceClient(process.env.HF_API_TOKEN);
        console.log('Hugging Face client initialized');
        
        const prompt = `As a programming mentor, analyze this code submission:
Language: ${language}
Verdict: ${verdict}
Failed Test Case:
Input: ${testCase.input}
Expected Output: ${testCase.expectedOutput}
Actual Output: ${testCase.output}

Code:
${code}

Provide a helpful hint that:
1. Points out what might be wrong
2. Suggests areas to check
3. Gives a general direction without revealing the exact solution
Keep the response concise and focused on the specific issue.`;

        console.log('Sending request to Hugging Face API...');
        const chatCompletion = await client.chatCompletion({
            provider: "hf-inference",
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [{
                role: "user",
                content: prompt
            }]
        });
        
        console.log('Received response from Hugging Face API');
        if (!chatCompletion.choices?.[0]?.message?.content) {
            throw new Error('No content in the response');
        }
        
        return chatCompletion.choices[0].message.content;
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
