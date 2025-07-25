import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptObfuscatorForm from './PromptObfuscatorForm';

// Helper to get input/output
const getInput = () => screen.getByLabelText(/your text/i);
const getOutput = () => screen.getByLabelText(/woven string/i);

// Helper to get checkboxes
const getCheckbox = (label: string) => screen.getByLabelText(label);

// Helper to get radio
const getRadio = (label: string) => screen.getByLabelText(label);

// Helper to get specific char input
const getSpecificCharInput = () => screen.getByPlaceholderText(/enter character/i);

describe('PromptObfuscatorForm', () => {
  beforeEach(() => {
    render(<PromptObfuscatorForm />);
  });

  it('all options are off by default', () => {
    expect(getCheckbox(/character injection/i)).not.toBeChecked();
    expect(getCheckbox(/remove spaces/i)).not.toBeChecked();
    expect(getCheckbox(/remove newlines/i)).not.toBeChecked();
    expect(getCheckbox(/reverse the final string/i)).not.toBeChecked();
  });

  it('toggles options and updates output', () => {
    fireEvent.change(getInput(), { target: { value: 'A B\nC' } });
    // Remove spaces
    fireEvent.click(getCheckbox(/remove spaces/i));
    expect(getOutput()).toHaveValue('AB\nC');
    // Remove newlines
    fireEvent.click(getCheckbox(/remove newlines/i));
    expect(getOutput()).toHaveValue('ABC');
    // Reverse
    fireEvent.click(getCheckbox(/reverse the final string/i));
    expect(getOutput()).toHaveValue('CBA');
  });

  it('character injection (specific) works', () => {
    fireEvent.change(getInput(), { target: { value: 'AB' } });
    fireEvent.click(getCheckbox(/character injection/i));
    fireEvent.click(getRadio(/add specific character/i));
    fireEvent.change(getSpecificCharInput(), { target: { value: '-' } });
    expect(getOutput()).toHaveValue('A-B');
  });

  it('character injection (random) works', () => {
    fireEvent.change(getInput(), { target: { value: 'AB' } });
    fireEvent.click(getCheckbox(/character injection/i));
    fireEvent.click(getRadio(/add random symbols/i));
    // Output should be A<symbol>B or similar, length 3
    const val = getOutput().value;
    expect(val.length).toBe(3);
    expect(val[0]).toBe('A');
    expect(val[2]).toBe('B');
  });

  it('font class is consistent for all labels/options', () => {
    // All labels should have font-normal or text-lg/font-normal
    const labels = screen.getAllByText(/character injection|remove spaces|remove newlines|reverse the final string|no character addition|add specific character|add random symbols/i);
    labels.forEach(label => {
      expect(label.className).toMatch(/font-normal|text-lg/);
    });
  });
}); 