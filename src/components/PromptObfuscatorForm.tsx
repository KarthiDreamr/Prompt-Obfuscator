'use client';

import React from "react";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Copy,
  Repeat,
  Space,
  Pilcrow,
  Github,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CharacterAdditionMode = 'specific' | 'random' | 'unicode';

export default function PromptObfuscatorForm() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [charInjectionEnabled, setCharInjectionEnabled] = useState(false);
  const [charAdditionMode, setCharAdditionMode] = useState<CharacterAdditionMode>('specific');
  const [specificChar, setSpecificChar] = useState('');
  const [unicodeChar, setUnicodeChar] = useState('');
  const [shouldReverse, setShouldReverse] = useState(false);
  const [shouldRemoveSpaces, setShouldRemoveSpaces] = useState(false);
  const [shouldRemoveNewlines, setShouldRemoveNewlines] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [showHexDump, setShowHexDump] = useState(false);

  const { toast } = useToast();

  const getRandomCharacter = (): string => {
    const chars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?~'; // Only symbols
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  const parseUnicodeString = (unicodeStr: string): string => {
    try {
      // Handle formats like U+E01EC, U+200B, 0xE01EC, E01EC
      let cleanStr = unicodeStr.trim().toUpperCase();
      
      // Remove U+ prefix if present
      if (cleanStr.startsWith('U+')) {
        cleanStr = cleanStr.substring(2);
      }
      // Remove 0x prefix if present
      else if (cleanStr.startsWith('0X')) {
        cleanStr = cleanStr.substring(2);
      }
      
      // Parse as hexadecimal and convert to character
      const codePoint = parseInt(cleanStr, 16);
      if (isNaN(codePoint) || codePoint < 0 || codePoint > 0x10FFFF) {
        return '';
      }
      
      return String.fromCodePoint(codePoint);
    } catch (error) {
      return '';
    }
  };

  const generateHexDump = (text: string): string => {
    return Array.from(text)
      .map((char, index) => {
        const codePoint = char.codePointAt(0);
        const hex = codePoint?.toString(16).toUpperCase().padStart(4, '0') || '0000';
        const displayChar = codePoint && codePoint >= 32 && codePoint <= 126 ? char : '·';
        return `${index.toString().padStart(2, '0')}: U+${hex} (${displayChar})`;
      })
      .join('\n');
  };

  const handleProcessText = () => {
    let processedText = inputText;

    if (shouldRemoveNewlines) {
      processedText = processedText.replace(/[\n\r]/g, '');
    }
    if (shouldRemoveSpaces) {
      processedText = processedText.replace(/ /g, ''); 
    }

    if (charInjectionEnabled) {
      if (charAdditionMode === 'specific' && specificChar) {
        if (processedText.length > 0) {
          processedText = processedText.split('').join(specificChar);
        }
      } else if (charAdditionMode === 'random') {
        if (processedText.length > 0) {
          if (processedText.length === 1) {
            // For a single character, no random characters are woven.
          } else {
            processedText = processedText
              .split('')
              .map((char) => char + getRandomCharacter())
              .join('')
              .slice(0, -1);
          }
        }
      } else if (charAdditionMode === 'unicode' && unicodeChar) {
        const unicodeCharacter = parseUnicodeString(unicodeChar);
        if (unicodeCharacter && processedText.length > 0) {
          processedText = processedText.split('').join(unicodeCharacter);
        }
      }
    }
    
    if (shouldReverse) {
      processedText = processedText.split('').reverse().join('');
    }

    setOutputText(processedText);
  };

  useEffect(() => {
    handleProcessText();
  }, [inputText, charInjectionEnabled, charAdditionMode, specificChar, unicodeChar, shouldReverse, shouldRemoveSpaces, shouldRemoveNewlines]);
  
  useEffect(() => {
    if (inputText.trim()) {
      setShowOutput(true);
    } else {
      setShowOutput(false);
    }
  }, [inputText]);


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
    <Card className="w-full max-w-5xl shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline tracking-tight">Prompt Obfuscator</CardTitle>
        <CardDescription>Enter your text, choose an option, and watch it transform!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="inputText" className="text-lg">Input</Label>
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="charInjectionEnabled"
              checked={charInjectionEnabled}
              onCheckedChange={(checked) => setCharInjectionEnabled(checked as boolean)}
            />
            <Label htmlFor="charInjectionEnabled" className="font-normal">
              Character Injection (Between Letters)
            </Label>
          </div>
          {charInjectionEnabled && (
            <div className="ml-6 space-y-2">
              <RadioGroup
                value={charAdditionMode}
                onValueChange={(value) => setCharAdditionMode(value as CharacterAdditionMode)}
                className="space-y-2"
              >
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
                  <Label htmlFor="random" className="font-normal">Add random symbols (e.g. !@#$%^&*)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unicode" id="unicode" />
                  <Label htmlFor="unicode" className="font-normal">Add Unicode character</Label>
                </div>
                {charAdditionMode === 'unicode' && (
                  <div className="mt-1 ml-6 space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter Unicode (e.g., U+E01EC, U+200B)"
                      value={unicodeChar}
                      onChange={(e) => setUnicodeChar(e.target.value)}
                      className="w-full max-w-xs focus:ring-accent focus:border-accent"
                      aria-label="Unicode character input"
                    />
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground mr-2">Quick presets:</span>
                      {[
                        { code: 'U+200B', name: 'Zero Width Space' },
                        { code: 'U+200C', name: 'Zero Width Non-Joiner' },
                        { code: 'U+200D', name: 'Zero Width Joiner' },
                        { code: 'U+FEFF', name: 'Zero Width No-Break Space' },
                        { code: 'U+E01EC', name: 'Private Use' }
                      ].map(({ code, name }) => (
                        <Button
                          key={code}
                          variant="outline"
                          size="sm"
                          onClick={() => setUnicodeChar(code)}
                          className="text-xs h-6 px-2"
                          title={name}
                        >
                          {code}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeSpaces"
              checked={shouldRemoveSpaces}
              onCheckedChange={(checked) => setShouldRemoveSpaces(checked as boolean)}
            />
            <Label htmlFor="removeSpaces" className="font-normal flex items-center">
              Remove spaces
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeNewlines"
              checked={shouldRemoveNewlines}
              onCheckedChange={(checked) => setShouldRemoveNewlines(checked as boolean)}
            />
            <Label htmlFor="removeNewlines" className="font-normal flex items-center">
              Remove newlines
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reverseString"
              checked={shouldReverse}
              onCheckedChange={(checked) => setShouldReverse(checked as boolean)}
            />
            <Label htmlFor="reverseString" className="font-normal flex items-center">
              Reverse the final string
            </Label>
          </div>
        </div>

        {showOutput && (
          <div className="space-y-2 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
              <Label htmlFor="outputText" className="text-lg">Output</Label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {outputText.length} characters
                </span>
                {outputText && charAdditionMode === 'unicode' && unicodeChar && (
                  <span className="text-xs text-blue-400 cursor-help" title="Unicode characters may be invisible or stripped during copy/paste">
                    Unicode injected
                  </span>
                )}
                {outputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHexDump(!showHexDump)}
                    className="text-xs h-6 px-2"
                  >
                    {showHexDump ? 'Hide' : 'Show'} Hex
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <Textarea
                id="outputText"
                value={outputText}
                readOnly
                rows={5}
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
            {showHexDump && outputText && (
              <div className="mt-2">
                <Label className="text-sm text-muted-foreground">Character Analysis</Label>
                <div className="bg-muted/30 rounded-md p-3 mt-1 font-mono text-xs">
                  <pre className="whitespace-pre-wrap text-muted-foreground">
                    {generateHexDump(outputText)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center items-center p-4 border-t">
        <a
          href="https://github.com/KarthiDreamr/Prompt-Obfuscator"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="w-4 h-4 mr-2" />
          Made by KarthiDreamr
        </a>
      </CardFooter>
    </Card>
  );
}

