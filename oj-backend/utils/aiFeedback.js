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
        
        const prompt = `[INST] <<SYS>>
You are a programming mentor. Your task is to provide a single, concise hint for a coding problem. 
- Do not include any explanations, reasoning, or steps
- Do not mention specific test cases or input/output values
- Do not reveal the exact solution
- Focus on the general approach or concept
- Keep the hint generic and applicable to any similar input
<</SYS>>

Problem details:
Language: ${language}
Verdict: ${verdict}
The code is not producing the expected output. The input and output formats are correct, but the transformation is incorrect.

Code:
${code}

Provide a single hint that suggests the general approach or concept needed, without mentioning specific test cases. [/INST]`;

        console.log('Sending request to Hugging Face API...');
        const response = await client.textGeneration({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            inputs: prompt,
            parameters: {
                max_new_tokens: 100,
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
            // Remove any system prompts or instructions
            .replace(/\[INST\].*?\[\/INST\]/gs, '')
            .replace(/<<SYS>>.*?<<\/SYS>>/gs, '')
            // Remove the problem details section
            .replace(/Problem details:.*?Code:/gs, '')
            // Remove any markdown formatting
            .replace(/\*\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/---/g, '')
            // Remove any "Hint:" or similar prefixes
            .replace(/^(Hint|Suggestion|Advice|Response):\s*/i, '')
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
        if (hint.length > 150) {
            hint = hint.substring(0, 147) + '...';
        }

        // Final check to ensure we don't return the prompt or test cases
        if (hint.includes('You are a programming mentor') || 
            hint.includes('Problem details') || 
            hint.includes('Language:') || 
            hint.includes('Verdict:') ||
            hint.includes(testCase.input) ||
            hint.includes(testCase.expectedOutput) ||
            hint.includes(testCase.output)) {
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
