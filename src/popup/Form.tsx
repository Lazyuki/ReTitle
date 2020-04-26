import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/compat';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

import Gear from './Gear';
import CurrentTitle from './CurrentTitle';
import BookmarkTitle from './BookmarkTitle';

type TabOption = 'onetime' | 'tablock' | 'exact' | 'fulldomain' | 'domain';

const useStyles = makeStyles({
  root: {
    width: '400px',
    padding: '20px',
    overflow: 'hidden',
  },
  input: {
    width: '100%',
  },
  radios: {
    margin: '10px 0',
    paddingLeft: '20px',
  },
  version: {
    textAlign: 'right',
    opacity: 0.5,
    fontSize: '12px',
  },
});

const Form = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);
  const [option, setOption] = useState<TabOption>('onetime');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const styles = useStyles();

  useEffect(() => {
    const initialize = (tabs: chrome.tabs.Tab[]) => {
      const currentTab = tabs[0];
      setTab(currentTab);
      setInputValue(currentTab.title || '');
      chrome.storage.sync.get('options', (items) => {
        if (items['options']) {
          const options = items['options'];
          if (options.domain) setOption('domain');
          if (options.onetime) setOption('onetime');
          if (options.tablock) setOption('tablock');
          if (options.exact) setOption('exact');
        }
      });
      setTimeout(() => {
        inputRef?.current?.select();
      }, 0);
    };
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      initialize
    );
  }, []);

  const handleOptionChange = useCallback((e: any) => {
    setOption(e.target.value);
  }, []);

  return (
    <div className={styles.root}>
      <Gear />
      <CurrentTitle currentTitle={tab?.title} setInputValue={setInputValue} />
      <BookmarkTitle url={tab?.url} setInputValue={setInputValue} />
      <TextField
        multiline
        className={styles.input}
        inputRef={inputRef}
        label="New Title"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={(e) => e.target.select()}
      />
      <FormControl className={styles.radios} component="fieldset">
        <RadioGroup
          aria-label="option"
          name="option"
          value={option}
          onChange={handleOptionChange}
        >
          <FormControlLabel
            value="onetime"
            control={<Radio color="primary" />}
            label="Set it temporarily"
          />
          <FormControlLabel
            value="tab"
            control={<Radio color="primary" />}
            label="Set for this tab*"
          />
          <FormControlLabel
            value="exact"
            control={<Radio color="primary" />}
            label="Set for this exact URL"
          />
          <FormControlLabel
            value="domain"
            control={<Radio color="primary" />}
            label={`Set for this domain: ${tab?.url}`}
          />
        </RadioGroup>
      </FormControl>
      <Button variant="contained" color="primary">
        Set Title
      </Button>
      <div className={styles.version}>v__extension_version__</div>
    </div>
  );
};
export default Form;
