// import { HfInference } from '@huggingface/inference';

// export const generateAIFeedback = async (code, language, verdict, testCase) => {
//     try {
//         const client = new HfInference(process.env.HF_API_TOKEN);
        
//         const prompt = `
//         You are a programming mentor.
        
//         A student wrote some code that failed a test case. 
//         Your task is to give **only a helpful hint** — not a solution.
        
//         The hint should:
//         - Point out what might be wrong
//         - Suggest what to check
//         - Give general direction, **without revealing how to fix it**
        
//         Avoid detailed steps or exact code.
        
//         --- Student Submission ---
//         Language: ${language}
//         Verdict: ${verdict}
        
//         Failed Test Case:
//         Input: ${testCase.input}
//         Expected Output: ${testCase.expectedOutput}
//         Actual Output: ${testCase.output}
        
//         Code:
//         ${code}
        
//         --- Your Hint ---
//         `;
        
// // const prompt = `You are a helpful programming mentor. 
// // Provide a helpful hint for a student's code submission that failed on a test case. 
// // Do NOT provide a full solution. Instead:
// // 1. Point out what might be wrong.
// // 2. Suggest what to check.
// // 3. Give general direction, focusing on the specific issue.

// // Now analyze the following:
// // Language: ${language}
// // Verdict: ${verdict}
// // Failed Test Case:
// // Input: ${testCase.input}
// // Expected Output: ${testCase.expectedOutput}
// // Actual Output: ${testCase.output}

// // Code:
// // ${code}
// // `;
//         const response = await client.textGeneration({
//             model: "meta-llama/Llama-3.1-8B-Instruct",
//             inputs: prompt,
//             parameters: {
//                 max_new_tokens: 250,
//                 temperature: 0.5,
//                 top_p: 0.95,
//                 repetition_penalty: 1.1
//             }
//         });
        
//         return response.generated_text;
//     } catch (error) {
//         console.error('AI Feedback Error:', error);
//         // Provide more specific fallback messages based on the verdict
//         switch (verdict) {
//             case 'Wrong Answer':
//                 return "Check your logic for handling edge cases and verify your output format matches exactly what's expected.";
//             case 'Time Limit Exceeded':
//                 return "Your solution might be using an inefficient algorithm. Consider optimizing your approach or using a more efficient data structure.";
//             case 'Runtime Error':
//                 return "Look for potential null pointer dereferences, array index out of bounds, or division by zero in your code.";
//             default:
//                 return "Review your code logic and ensure it handles all possible input cases correctly.";
//         }
//     }
// };


import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper function to format the feedback
function formatAIResponse(feedback) {
    // Define the sections we want to format
    const sections = [
        'Current Behavior:',
        'Missing/Incorrect:',
        'Suggestion:',
        'Code Quality:',
        'Tip:'
    ];

    // First, normalize the feedback
    let normalized = feedback;

    // Remove any markdown formatting
    normalized = normalized.replace(/\*\*/g, '');
    normalized = normalized.replace(/\*/g, '');
    normalized = normalized.replace(/`/g, '');

    // Split the feedback into sections
    const sectionContent = {};
    let currentSection = null;
    let currentContent = [];

    // Split into lines and process
    const lines = normalized.split('\n').map(line => line.trim()).filter(line => line);
    
    for (const line of lines) {
        // Check if this line is a section header
        const matchedSection = sections.find(section => 
            line.toLowerCase() === section.toLowerCase()
        );

        if (matchedSection) {
            // Save previous section content
            if (currentSection) {
                sectionContent[currentSection] = currentContent.join('\n').trim();
            }
            // Start new section
            currentSection = matchedSection;
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(line);
        }
    }

    // Save the last section
    if (currentSection) {
        sectionContent[currentSection] = currentContent.join('\n').trim();
    }

    // Build the formatted response
    let formattedResponse = '';
    for (const section of sections) {
        formattedResponse += `${section}\n${sectionContent[section] || 'Not provided'}\n\n`;
    }

    return formattedResponse.trim();
}

export const generateAIFeedback = async (code, language, verdict, testCase) => {
    try {
        // Check if API key is set
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.error('GOOGLE_AI_API_KEY is not set in environment variables');
            throw new Error('AI API key not configured');
        }

        // Initialize the Google Generative AI with your API key
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        // Use gemini-2.0-flash model with optimized configuration
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.4,  // Lower temperature for more focused responses
                topK: 20,         // Reduced for more focused suggestions
                topP: 0.8,        // Balanced for quality and speed
                maxOutputTokens: 1000, // Increased for more detailed feedback
            }
        });

        console.log('Generating AI feedback for:', {
            language,
            verdict,
            testCaseInput: testCase.input,
            testCaseExpected: testCase.expectedOutput,
            testCaseActual: testCase.output
        });

        const prompt = `As a programming mentor, analyze this code submission and provide a helpful hint:

Problem Description:
${testCase.description || 'No problem description provided'}

Language: ${language}
Verdict: ${verdict}

Code:
${code}

Please provide a helpful hint that:
1. Specifically identifies what the current code is doing
2. Points out exactly what's missing or incorrect based on the problem description
3. Suggests a specific approach or technique to consider without telling the exact solution
4. Mentions any common pitfalls to avoid
5. Uses a friendly and encouraging tone
6. Lastly comment about the code quality and how to improve it

IMPORTANT RULES:
1. DO NOT mention or reference any specific test cases or their inputs/outputs
2. DO NOT reveal the expected output format
3. Focus on the specific task mentioned in the problem description
4. Keep hints relevant to the actual problem requirements
5. Follow the exact format below:

Current Behavior:
[what the code is doing]

Missing/Incorrect:
[what needs to be fixed based on the problem description]

Suggestion:
[specific approach to try for this particular problem]

Code Quality:
[comment about code quality]

Tip:
[common pitfall to avoid for this specific task]

Keep the response focused on the specific problem requirements and avoid generic programming advice.`;

        console.log('Sending request to Google AI...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawFeedback = response.text();
        console.log('Received raw AI feedback:', rawFeedback);

        // Format the feedback
        const formattedFeedback = formatAIResponse(rawFeedback);
        console.log('Formatted feedback:', formattedFeedback);

        // If the feedback is too long, truncate it at a higher limit
        return formattedFeedback.length > 2000 ? formattedFeedback.substring(0, 1997) + '...' : formattedFeedback;
    } catch (error) {
        console.error('AI Feedback Error Details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Provide more specific fallback messages based on the verdict
        switch (verdict) {
            case 'Wrong Answer':
                return "Check your logic for handling edge cases and verify your output format matches exactly what's expected. Pay attention to spaces, newlines, and special characters in the output.";
            case 'Time Limit Exceeded':
                return "Your solution might be using an inefficient algorithm. Consider optimizing your approach or using a more efficient data structure. Look for opportunities to reduce time complexity.";
            case 'Runtime Error':
                return "Look for potential null pointer dereferences, array index out of bounds, or division by zero in your code. Also check for proper initialization of variables and array sizes.";
            case 'Compilation Error':
                return "Check your syntax carefully. Look for missing semicolons, brackets, or incorrect variable declarations. Make sure all required headers are included.";
            default:
                return "Review your code logic and ensure it handles all possible input cases correctly. Double-check your algorithm's correctness.";
        }
    }
};
