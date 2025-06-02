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
        
        const prompt = `[INST] You are a programming mentor. Provide a single, concise hint for this code. Focus on the general approach needed, without mentioning specific test cases.

Language: ${language}
Verdict: ${verdict}
The code needs to transform the input in a specific way.

Code:
${code}

Give a brief hint about what might be wrong or what approach to consider. [/INST]`;

        console.log('Sending request to Hugging Face API...');
        const response = await client.textGeneration({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            inputs: prompt,
            parameters: {
                max_new_tokens: 80,
                temperature: 0.7,
                top_p: 0.95,
                repetition_penalty: 1.1,
                return_full_text: false
            }
        });
        
        console.log('Received response from Hugging Face API');
        if (!response.generated_text) {
            throw new Error('No content in the response');
        }

        // Clean up the response
        let hint = response.generated_text
            // Remove any instruction tags
            .replace(/\[INST\].*?\[\/INST\]/gs, '')
            .replace(/<<SYS>>.*?<<\/SYS>>/gs, '')
            .replace(/<<ANS>>/g, '')
            .replace(/<<\/ANS>>/g, '')
            // Remove any other model-specific tags
            .replace(/<<.*?>>/g, '')
            // Remove any markdown formatting
            .replace(/\*\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/---/g, '')
            // Remove any "Hint:" or similar prefixes
            .replace(/^(Hint|Suggestion|Advice|Response|Answer):\s*/i, '')
            // Remove any step-by-step sections
            .replace(/\n## Step.*$/s, '')
            // Remove any remaining code blocks
            .replace(/```.*?```/gs, '')
            // Remove any remaining newlines and extra spaces
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            // Trim whitespace
            .trim()
            // Remove any trailing periods
            .replace(/\.+$/, '')
            // Add a single period at the end
            + '.';

        // If the hint is too long, truncate it
        if (hint.length > 120) {
            hint = hint.substring(0, 117) + '...';
        }

        // Final check to ensure we don't return the prompt or test cases
        if (hint.includes('You are a programming mentor') || 
            hint.includes('Language:') || 
            hint.includes('Verdict:') ||
            hint.includes(testCase.input) ||
            hint.includes(testCase.expectedOutput) ||
            hint.includes(testCase.output) ||
            hint.includes('<<') ||
            hint.includes('>>')) {
            return "Consider reviewing your code logic and checking if it performs the required transformation correctly.";
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
