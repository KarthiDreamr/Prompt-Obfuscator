
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CharacterAdditionMode = 'none' | 'specific' | 'random';

export default function StringWeaveForm() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [charAdditionMode, setCharAdditionMode] = useState<CharacterAdditionMode>('none');
  const [specificChar, setSpecificChar] = useState('');
  const [shouldReverse, setShouldReverse] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const { toast } = useToast();

  const getRandomAlphaNumeric = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  const handleProcessText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    const strippedTextValue = inputText.replace(/\s/g, '');
    let processedText = strippedTextValue;

    if (charAdditionMode === 'specific' && specificChar) {
      if (processedText.length > 0) {
          processedText = processedText.split('').join(specificChar);
      } else {
          processedText = "";
      }
    } else if (charAdditionMode === 'random') {
      if (processedText.length > 0) {
          if (processedText.length === 1) {
              // For a single character, no random characters are woven.
          } else {
              processedText = processedText
                  .split('')
                  .map((char) => char + getRandomAlphaNumeric())
                  .join('')
                  .slice(0, -1);
          }
      } else {
          processedText = "";
      }
    }
    
    if (shouldReverse) {
      processedText = processedText.split('').reverse().join('');
    }

    setOutputText(processedText);
  };

  useEffect(() => {
    handleProcessText();
  }, [inputText, charAdditionMode, specificChar, shouldReverse]);
  
  useEffect(() => {
    if (!inputText.trim()) {
      setShowOutput(false);
    } else if (outputText) {
      setShowOutput(true);
    } else {
      setShowOutput(false);
    }
  }, [outputText, inputText]);


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
        <CardDescription>Enter your text, choose an option, and watch it transform!</CardDescription>
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
                placeholder="Enter character (e.g., -, _, *)"
                value={specificChar}
                onChange={(e) => setSpecificChar(e.target.value.slice(0,1))}
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

        <div className="space-y-3">
          <Label className="text-lg">Other Operations</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reverseString"
              checked={shouldReverse}
              onCheckedChange={(checked) => setShouldReverse(checked as boolean)}
            />
            <Label htmlFor="reverseString" className="font-normal flex items-center">
              <Repeat className="mr-2 h-4 w-4" />
              Reverse the final string
            </Label>
          </div>
        </div>

        <div className={`space-y-2 transition-opacity duration-300 ease-in-out ${showOutput ? 'opacity-100' : 'opacity-0'}`}>
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
      </CardContent>
      <CardFooter className="text-center justify-center">
        <p className="text-xs text-muted-foreground">String operations are applied automatically.</p>
      </CardFooter>
    </Card>
  );
}
