import { OpenAI } from "openai";
import { db } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a plan using OpenAI based on user questionnaire data
 * @param {string} uid - User ID
 * @param {string} questionnaireCollection - Collection name for questionnaire data
 * @param {string} planCollection - Collection name for storing generated plans
 * @param {Function} promptGenerator - Function to generate prompt from user data
 * @param {Function} formatFunction - Optional function to format the plan
 * @returns {Object} Generated plan data and status
 */
export const generatePlan = async (
    uid,
    questionnaireCollection,
    planCollection,
    promptGenerator,
    formatFunction = null
) => {
    try {
        // Get the questionnaire data from the database
        const questionnaireRef = db.collection(questionnaireCollection).doc(uid);
        const questionnaireDoc = await questionnaireRef.get();

        if (!questionnaireDoc.exists) {
            return {
                success: false,
                status: 404,
                message: `${questionnaireCollection} not found`
            };
        }

        const userData = questionnaireDoc.data();

        // Generate the prompt using the questionnaire data
        const prompt = promptGenerator(userData);

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You must return raw JSON ONLY, with no explanations, backticks, or markdown. Never use ```json or ``` in your response."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.6,
            max_tokens: 3000
        });

        let planContent = response.choices[0].message.content.trim();

        // Remove any markdown code block indicators if present
        planContent = planContent.replace(/^```json\n|^```\n|```$/g, '');

        try {
            const plan = JSON.parse(planContent);

            // Store the generated plan in Firestore
            await db.collection(planCollection).doc(uid).set(plan);

            // Optionally format the plan for better readability
            const formattedPlan = formatFunction ? formatFunction(plan) : plan;

            return {
                success: true,
                status: 200,
                message: `${planCollection} generated and stored successfully`,
                raw_plan: plan,
                formatted_plan: formattedPlan
            };
        } catch (jsonError) {
            console.error(`JSON parsing error (${planCollection}):`, jsonError);

            // Try to extract JSON if still in code blocks
            try {
                const jsonMatch = planContent.match(/```(?:json)?([\s\S]*?)```/);
                if (jsonMatch && jsonMatch[1]) {
                    const extractedJson = jsonMatch[1].trim();
                    const plan = JSON.parse(extractedJson);

                    // Store the extracted plan in Firestore
                    await db.collection(planCollection).doc(uid).set(plan);

                    // Format the plan
                    const formattedPlan = formatFunction ? formatFunction(plan) : plan;

                    return {
                        success: true,
                        status: 200,
                        message: `${planCollection} generated and stored successfully (extracted from code blocks)`,
                        raw_plan: plan,
                        formatted_plan: formattedPlan
                    };
                }
            } catch (extractionError) {
                console.error("JSON extraction failed:", extractionError);
            }

            return {
                success: false,
                status: 500,
                error: "Invalid JSON format received from OpenAI",
                raw_response: planContent
            };
        }
    } catch (error) {
        console.error("API error:", error);
        return {
            success: false,
            status: 500,
            message: `Error generating ${planCollection}`,
            error: error.message
        };
    }
};

/**
 * Generates a plan directly using OpenAI based on a provided prompt
 * @param {string} prompt - The prompt to send to OpenAI
 * @returns {Object|string} Parsed plan object or raw content if JSON parsing fails
 */
export const generatePlanDirect = async (prompt) => {
    try {
        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You must return raw JSON ONLY, with no explanations, backticks, or markdown. Never use ```json or ``` in your response."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.6,
            max_tokens: 3000
        });

        let planContent = response.choices[0].message.content.trim();


        // Remove any markdown code block indicators if present
        planContent = planContent.replace(/^```json\n|^```\n|```$/g, '');

        try {
            const plan = JSON.parse(planContent);
            return plan;
        } catch (jsonError) {
            console.error(`JSON parsing error:`, jsonError);
            return planContent; // Return raw content if JSON parsing fails
        }
    } catch (error) {
        console.error("API error:", error);
        throw new Error(`Error generating plan: ${error.message}`);
    }
};

export default {
    generatePlan,
    generatePlanDirect
};