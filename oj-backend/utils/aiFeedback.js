import { HfInference } from '@huggingface/inference';

export const generateAIFeedback = async (code, language, verdict, testCase) => {
    try {
        console.log('Starting AI Feedback Generation...');
        console.log('Environment check - HF_API_TOKEN exists:', !!process.env.HF_API_TOKEN);
        
        const client = new HfInference(process.env.HF_API_TOKEN);
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
2. Gives a general direction without revealing the exact solution
Keep the response concise and focused on the specific issue.`;

        console.log('Sending request to Hugging Face API...');
        const response = await client.textGeneration({
            model: "meta-llama/Llama-2-7b-chat-hf",
            inputs: prompt,
            parameters: {
                max_new_tokens: 250,
                temperature: 0.7,
                top_p: 0.95,
                repetition_penalty: 1.1
            }
        });
        
        console.log('Received response from Hugging Face API');
        return response.generated_text;
    } catch (error) {
        console.error('AI Feedback Error Details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
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
