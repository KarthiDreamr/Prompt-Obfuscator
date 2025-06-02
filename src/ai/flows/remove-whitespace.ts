'use server';

/**
 * @fileOverview Removes whitespace characters from the input text.
 *
 * - removeWhitespace - A function that handles the whitespace removal process.
 * - RemoveWhitespaceInput - The input type for the removeWhitespace function.
 * - RemoveWhitespaceOutput - The return type for the removeWhitespace function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveWhitespaceInputSchema = z.object({
  text: z.string().describe('The text to remove whitespace from.'),
});
export type RemoveWhitespaceInput = z.infer<typeof RemoveWhitespaceInputSchema>;

const RemoveWhitespaceOutputSchema = z.object({
  strippedText: z.string().describe('The text with whitespace removed.'),
});
export type RemoveWhitespaceOutput = z.infer<typeof RemoveWhitespaceOutputSchema>;

export async function removeWhitespace(input: RemoveWhitespaceInput): Promise<RemoveWhitespaceOutput> {
  return removeWhitespaceFlow(input);
}

const removeWhitespacePrompt = ai.definePrompt({
  name: 'removeWhitespacePrompt',
  input: {schema: RemoveWhitespaceInputSchema},
  output: {schema: RemoveWhitespaceOutputSchema},
  prompt: `Remove all newline characters and extra spaces from the following text:\n\n{{{text}}}`,
});

const removeWhitespaceFlow = ai.defineFlow(
  {
    name: 'removeWhitespaceFlow',
    inputSchema: RemoveWhitespaceInputSchema,
    outputSchema: RemoveWhitespaceOutputSchema,
  },
  async input => {
    const {output} = await removeWhitespacePrompt(input);
    return output!;
  }
);
