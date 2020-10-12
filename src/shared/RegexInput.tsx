import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/compat';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
    marginBottom: '10px',
    marginRight: '40px',
    wordBreak: 'break-all',
  },
  input: {
    width: '100%',
  },
});

function useDebounce<T>(value: T, delayMillis: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMillis);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delayMillis]);
  return debouncedValue;
}

const RegexInput = ({
  label,
  setValidInputValue,
  initialValue = '',
}: {
  label: string;
  setValidInputValue: (value: string) => void;
  initialValue?: string;
}) => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState(initialValue);
  const [error, setError] = useState('');
  const debouncedInput = useDebounce(inputValue, 250);

  useEffect(() => {
    try {
      new RegExp(String.raw`${debouncedInput}`);
      setError('');
      setValidInputValue(debouncedInput);
    } catch (e) {
      setError(e.message);
    }
  }, [debouncedInput]);

  return (
    <TextField
      error
      className={styles.input}
      label={label}
      value={inputValue}
      onKeyPress={(e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.target.blur();
          return false;
        }
      }}
      onChange={(e: any) => {
        setInputValue(e.target.value);
        setError('');
      }}
      onFocus={(e: any) => e.target.select()}
      helperText={error}
    />
  );
};

export default RegexInput;
