'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { removeWhitespace, type RemoveWhitespaceInput } from '@/ai/flows/remove-whitespace';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CharacterAdditionMode = 'none' | 'specific' | 'random';

export default function StringWeaveForm() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [charAdditionMode, setCharAdditionMode] = useState<CharacterAdditionMode>('none');
  const [specificChar, setSpecificChar] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  const { toast } = useToast();

  const getRandomAlphaNumeric = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some text to process.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowOutput(false); // Hide output before processing to trigger fade-in

    try {
      const aiInput: RemoveWhitespaceInput = { text: inputText };
      const result = await removeWhitespace(aiInput);
      let processedText = result.strippedText;

      if (charAdditionMode === 'specific' && specificChar) {
        processedText = processedText.split('').join(specificChar);
      } else if (charAdditionMode === 'random') {
        processedText = processedText
          .split('')
          .map((char) => char + getRandomAlphaNumeric())
          .join('')
          .slice(0, -1); // Remove last added random char
         if (processedText.length === 0 && result.strippedText.length > 0) { // handle single char input for random
            processedText = result.strippedText;
         }
      }
      
      setOutputText(processedText);

    } catch (e) {
      console.error('Error processing text:', e);
      setError('Failed to process text. Please try again.');
      toast({
        title: 'Processing Error',
        description: 'An error occurred while processing your text.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    if (outputText) {
      setShowOutput(true);
    }
  }, [outputText]);


  const handleCopyText = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText)
      .then(() => {
        toast({
          title: 'Copied to Clipboard!',
          description: 'The processed text has been copied.',
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: 'Copy Failed',
          description: 'Could not copy text to clipboard.',
          variant: 'destructive',
        });
      });
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline tracking-tight">StringWeave</CardTitle>
        <CardDescription>Enter your text, choose an option, and let us weave it for you!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="inputText" className="text-lg">Your Text</Label>
          <Textarea
            id="inputText"
            placeholder="Paste or type your string here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            className="focus:ring-accent focus:border-accent"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-lg">Character Weaving Options</Label>
          <RadioGroup
            value={charAdditionMode}
            onValueChange={(value) => setCharAdditionMode(value as CharacterAdditionMode)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="font-normal">No character addition</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="specific" />
              <Label htmlFor="specific" className="font-normal">Add specific character</Label>
            </div>
            {charAdditionMode === 'specific' && (
              <Input
                type="text"
                placeholder="Enter character to weave (e.g., -, _, *)"
                value={specificChar}
                onChange={(e) => setSpecificChar(e.target.value)}
                maxLength={1}
                className="mt-1 ml-6 w-full max-w-xs focus:ring-accent focus:border-accent"
                aria-label="Specific character input"
              />
            )}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random" className="font-normal">Add random characters (A-Z, a-z, 0-9)</Label>
            </div>
          </RadioGroup>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleProcessText}
          disabled={isProcessing || !inputText.trim()}
          className="w-full text-lg py-6 transform transition-transform duration-150 hover:scale-105 active:scale-95"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-5 w-5" />
          )}
          Weave String
        </Button>

        { (outputText || isProcessing) && (
          <div className={`space-y-2 transition-opacity duration-500 ease-in-out ${showOutput ? 'opacity-100' : 'opacity-0'}`}>
            <Label htmlFor="outputText" className="text-lg">Woven String</Label>
            <div className="relative">
              <Textarea
                id="outputText"
                value={outputText}
                readOnly
                rows={5}
                placeholder="Your processed text will appear here..."
                className="bg-muted/50 focus:ring-accent focus:border-accent"
              />
              {outputText && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyText}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transform transition-transform duration-150 hover:scale-110 active:scale-90"
                  aria-label="Copy output text"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-center justify-center">
        <p className="text-xs text-muted-foreground">Powered by GenAI & Next.js</p>
      </CardFooter>
    </Card>
  );
}
