import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/compat';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import RegexInput from './RegexInput';

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

const RegexInputGroup = ({
  onChange,
  initialValue = '',
}: {
  onChange: (value: string) => void;
  initialValue?: string;
}) => {
  const styles = useStyles();
  const [flag, setFlag] = useState(initialValue);
  const [capRegex, setCapRegex] = useState(initialValue);
  const [newRegex, setNewRegex] = useState(initialValue);

  const valid = /^[gimsuy]*$/.test(flag);

  useEffect(() => {
    const constructed = `/${capRegex}/${newRegex}/${flag}`;
    onChange(constructed);
  }, [flag, capRegex, newRegex]);
  return (
    <div>
      <RegexInput label="Capture Regex" setValidInputValue={setCapRegex} />
      <RegexInput label="New Title Regex" setValidInputValue={setNewRegex} />
      <TextField
        error={!valid}
        className={styles.input}
        label={'Flags'}
        value={flag}
        onKeyPress={(e: any) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.target.blur();
            return false;
          }
        }}
        onChange={(e: any) => {
          setFlag(e.target.value);
        }}
        onFocus={(e: any) => e.target.select()}
        helperText={!valid && 'Acceptable flags: g and i'}
      />
    </div>
  );
};

export default RegexInputGroup;
