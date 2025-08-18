import React, { useState, useMemo, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

interface WordAutocompleteBoxProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: string[];
  label?: string;
  helperText?: string;
  disabled?: boolean;
  sx?: any;
  multiple?: boolean;
  [key: string]: any;
}

function useWordAutocomplete(options: string[], inputValue: string): string[] {
  const [debouncedInput, setDebouncedInput] = useState(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedInput(inputValue), 200);
    return () => clearTimeout(handler);
  }, [inputValue]);

  return useMemo(() => {
    if (!debouncedInput) return options.slice(0, 10);
    const lowerInput = debouncedInput.toLowerCase();
    let exactMatch: string | null = null;
    const prefixMatches: string[] = [];
    const substringMatches: string[] = [];
    for (const word of options) {
      const lowerWord = word?.toLowerCase() || '';
      if (lowerWord && lowerWord === lowerInput) {
        exactMatch = word;
      } else if (lowerWord && lowerWord.startsWith(lowerInput)) {
        prefixMatches.push(word);
      } else if (lowerWord && lowerWord.includes(lowerInput)) {
        substringMatches.push(word);
      }
    }
    const result: string[] = [];
    if (exactMatch) result.push(exactMatch);
    // Remove duplicates from prefix and substring matches
    const used = new Set(result.map(w => w?.toLowerCase() || ''));
    for (const w of prefixMatches) {
      if (!used.has(w?.toLowerCase() || '')) {
        result.push(w);
        used.add(w?.toLowerCase() || '');
      }
      if (result.length >= 10) break;
    }
    if (result.length < 10) {
      for (const w of substringMatches) {
        if (!used.has(w?.toLowerCase() || '')) {
          result.push(w);
          used.add(w?.toLowerCase() || '');
        }
        if (result.length >= 10) break;
      }
    }
    return result;
  }, [debouncedInput, options]);
}

const WordAutocompleteBox: React.FC<WordAutocompleteBoxProps> = ({
  value,
  onChange,
  options,
  label,
  helperText,
  disabled,
  sx,
  multiple = false,
  ...rest
}) => {
  // For single-select: value is string, for multi-select: value is string[]
  const [inputValue, setInputValue] = useState(
    multiple ? '' : (value as string) || ''
  );
  useEffect(() => {
    if (!multiple) setInputValue((value as string) || '');
  }, [value, multiple]);
  const filteredOptions = useWordAutocomplete(options, inputValue);

  return (
    <Autocomplete
      multiple={multiple}
      options={filteredOptions}
      value={value}
      onChange={(_, v) => onChange(v as any)}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      filterOptions={x => x} // Already filtered
      getOptionLabel={option => option}
              disabled={disabled}
        sx={sx}
        renderInput={params => (
          <TextField 
            {...params} 
            label={label} 
            helperText={helperText}
            sx={{
              '& .MuiInputBase-root': {
              }
            }}
          />
        )}
        {...rest}
    />
  );
};

export default WordAutocompleteBox; 