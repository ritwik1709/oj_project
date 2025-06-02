import { HfInference } from '@huggingface/inference';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAIFeedback = async (code, language, verdict, testCase) => {
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
        try {
            console.log(`Starting AI Feedback Generation... (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
            console.log('Environment check - HF_API_TOKEN exists:', !!process.env.HF_API_TOKEN);
            
            const client = new HfInference(process.env.HF_API_TOKEN);
            console.log('Hugging Face client initialized');
            
            const prompt = `[INST] You are a programming mentor. Analyze this code submission and provide a helpful hint:

Language: ${language}
Verdict: ${verdict}
Failed Test Case:
Input: ${testCase.input}
Expected Output: ${testCase.expectedOutput}
Actual Output: ${testCase.output}

Code:
${code}

Provide a concise hint that:
1. Points out what might be wrong
2. Gives a general direction without revealing the exact solution
Focus on the specific issue. [/INST]`;

            console.log('Sending request to Hugging Face API...');
            const response = await client.textGeneration({
                model: "codellama/CodeLlama-7b-Instruct-hf",
                inputs: prompt,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.3,
                    top_p: 0.95,
                    repetition_penalty: 1.1,
                    return_full_text: false,
                    do_sample: true
                }
            });
            
            console.log('Received response from Hugging Face API');
            if (!response.generated_text) {
                throw new Error('No text generated from the model');
            }
            return response.generated_text.trim();
        } catch (error) {
            console.error(`AI Feedback Error Details (Attempt ${retryCount + 1}):`, {
                message: error.message,
                name: error.name,
                status: error.status,
                statusText: error.statusText,
                model: "codellama/CodeLlama-7b-Instruct-hf"
            });

            // Check for specific error types
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                console.error('Authentication error with Hugging Face API. Please check your API token permissions.');
                break; // Don't retry on auth errors
            }

            if (error.message.includes('fetching the blob')) {
                console.error('Model access error. This might be due to insufficient permissions or model availability.');
            }

            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY}ms...`);
                await sleep(RETRY_DELAY);
                retryCount++;
                continue;
            }
            
            // If we've exhausted retries, use fallback messages
            console.log('All retry attempts failed, using fallback message');
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
    }
};
