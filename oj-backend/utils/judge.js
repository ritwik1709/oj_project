import { executeCpp } from './executeCpp.js';
import { executePython } from './executePython.js';
import { executeJava } from './executeJava.js';
import fs from 'fs/promises';
import path from 'path';

const VERDICT = {
    ACCEPTED: 'Accepted',
    WRONG_ANSWER: 'Wrong Answer',
    TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
    COMPILATION_ERROR: 'Compilation Error',
    RUNTIME_ERROR: 'Runtime Error'
};

const compareOutputs = (expected, actual) => {
    console.log('\n=== Debug Output Comparison ===');
    console.log('Type of expected:', typeof expected);
    console.log('Type of actual:', typeof actual);
    console.log('Raw expected:', expected);
    console.log('Raw actual:', actual);
    console.log('Length of expected:', expected ? expected.length : 0);
    console.log('Length of actual:', actual ? actual.length : 0);
    console.log('ASCII codes of expected:', expected ? Array.from(expected).map(c => c.charCodeAt(0)) : []);
    console.log('ASCII codes of actual:', actual ? Array.from(actual).map(c => c.charCodeAt(0)) : []);
    console.log('===========================\n');

    // Normalize both outputs (remove trailing spaces, newlines, and convert to string)
    const normalizeOutput = (output) => {
        if (output === undefined || output === null) return '';
        return output.toString()
                    .replace(/\r\n/g, '\n')  // Convert Windows line endings
                    .replace(/\r/g, '\n')     // Convert old Mac line endings
                    .trim()
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('\n');
    };
    
    const normalizedExpected = normalizeOutput(expected);
    const normalizedActual = normalizeOutput(actual);
    
    console.log('Normalized expected:', JSON.stringify(normalizedExpected));
    console.log('Normalized actual:', JSON.stringify(normalizedActual));
    
    return normalizedExpected === normalizedActual;
};

const executeCode = async (language, code, input) => {
    try {
        console.log(`\n=== Executing ${language.toUpperCase()} Code ===`);
        console.log('Input:', JSON.stringify(input));
        console.log('Code:', code);
        
        let output;
        switch (language) {
            case 'cpp':
                output = await executeCpp(code, input);
                break;
            case 'python':
                output = await executePython(code, input);
                break;
            case 'java':
                output = await executeJava(code, input);
                break;
            default:
                throw new Error('Unsupported language');
        }
        
        console.log('Raw output:', JSON.stringify(output));
        console.log('================================\n');
        return { success: true, output };
    } catch (error) {
        console.error('Execution error:', error);
        if (error.error && error.error.includes('Time Limit Exceeded')) {
            return { success: false, verdict: VERDICT.TIME_LIMIT_EXCEEDED };
        }
        if (error.error && (error.error.includes('error') || error.error.includes('Error'))) {
            return { success: false, verdict: VERDICT.RUNTIME_ERROR, error: error.error };
        }
        return { success: false, verdict: VERDICT.COMPILATION_ERROR, error: error.error };
    }
};

export const judge = async (code, language, testCases) => {
    console.log('\n=== Starting Judge System ===');
    console.log('Test Cases:', JSON.stringify(testCases, null, 2));
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n--- Running Test Case ${i + 1} ---`);
        
        const result = await executeCode(language, code, testCase.input);
        
        if (!result.success) {
            console.log(`Test Case ${i + 1} Failed:`, result);
            return {
                verdict: result.verdict,
                failedTestCase: i + 1,
                error: result.error
            };
        }

        if (!compareOutputs(testCase.output, result.output)) {
            console.log(`Test Case ${i + 1} Wrong Answer`);
            return {
                verdict: VERDICT.WRONG_ANSWER,
                failedTestCase: i + 1,
                expected: testCase.output,
                got: result.output
            };
        }
        
        console.log(`Test Case ${i + 1} Passed`);
    }

    console.log('\nAll Test Cases Passed!');
    return {
        verdict: VERDICT.ACCEPTED
    };
}; 