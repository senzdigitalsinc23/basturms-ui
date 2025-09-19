'use server';
/**
 * @fileOverview Generates onboarding tips for new users based on their role.
 *
 * - generateUserOnboardingTips - A function that generates onboarding tips.
 * - GenerateUserOnboardingTipsInput - The input type for the generateUserOnboardingTips function.
 * - GenerateUserOnboardingTipsOutput - The return type for the generateUserOnboardingTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUserOnboardingTipsInputSchema = z.object({
  role: z
    .enum(['Admin', 'Teacher', 'Student', 'Parent'])
    .describe('The role of the user for whom onboarding tips are needed.'),
});
export type GenerateUserOnboardingTipsInput = z.infer<
  typeof GenerateUserOnboardingTipsInputSchema
>;

const GenerateUserOnboardingTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('Array of onboarding tips for the user.'),
});
export type GenerateUserOnboardingTipsOutput = z.infer<
  typeof GenerateUserOnboardingTipsOutputSchema
>;

export async function generateUserOnboardingTips(
  input: GenerateUserOnboardingTipsInput
): Promise<GenerateUserOnboardingTipsOutput> {
  return generateUserOnboardingTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUserOnboardingTipsPrompt',
  input: {schema: GenerateUserOnboardingTipsInputSchema},
  output: {schema: GenerateUserOnboardingTipsOutputSchema},
  prompt: `You are an onboarding expert. Generate onboarding tips for a new user with the role of {{role}} for a school management system called CampusConnect. The tips should be concise and easy to follow.`,
});

const generateUserOnboardingTipsFlow = ai.defineFlow(
  {
    name: 'generateUserOnboardingTipsFlow',
    inputSchema: GenerateUserOnboardingTipsInputSchema,
    outputSchema: GenerateUserOnboardingTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
