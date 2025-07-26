import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Box } from '@mui/material';
// import EmbeddingService from '../EmbeddingService';

interface YearSelectBoxProps {
  value: number | null;
  onChange: (year: number) => void;
  children?: (years: number[], loading: boolean) => React.ReactNode;
  label?: string;
  sx?: any;
  years?: number[];
}

const YearSelectBox: React.FC<YearSelectBoxProps> = ({ value, onChange, children, label = 'Year', sx, years: yearsProp }) => {
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (yearsProp && yearsProp.length > 0) {
      setYears(yearsProp);
      setLoading(false);
      return;
    }
    let mounted = true;
    async function fetchYears() {
      setLoading(true);
      const res = await fetch('embeddings/index.json');
      const index = await res.json();
      if (mounted) {
        setYears(index.map((e: {year: number}) => e.year));
        setLoading(false);
      }
    }
    fetchYears();
    return () => { mounted = false; };
  }, [yearsProp]);

  const handleChange = (event: any) => {
    const year = event.target.value;
    if (typeof year === 'number') onChange(year);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <FormControl size="small" sx={{ minWidth: 120 }} disabled={loading || years.length === 0}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value ?? ''}
          label={label}
          onChange={handleChange}
        >
          {years.map(year => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      {children && children(years, loading)}
    </Box>
  );
};

export default YearSelectBox; 