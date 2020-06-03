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
import { extractDomain } from '../shared/utils';
import { TabOption } from '../shared/types';
import { saveTitle, getDefaultOption } from '../shared/StorageHandler';

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
  button: {
    display: 'block',
    margin: '0 auto',
  },
  version: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
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

  const setInputAndSelect = useCallback(
    (newInput?: string) => {
      setInputValue(newInput || '');
      setTimeout(() => {
        inputRef?.current?.select();
      }, 0);
    },
    [inputRef]
  );

  const initialize = useCallback(
    (tabs: chrome.tabs.Tab[]) => {
      const currentTab = tabs[0];
      setTab(currentTab);
      setInputAndSelect(currentTab.title || '');
      getDefaultOption(setOption);
    },
    [setInputAndSelect]
  );

  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      initialize
    );
  }, [initialize]);

  const handleOptionChange = useCallback((e: any) => {
    setOption(e.target.value);
  }, []);

  const setTitle = useCallback(() => {
    if (tab) {
      chrome.runtime.sendMessage({
        id: tab.id,
        oldTitle: tab.title,
        newTitle: inputValue,
      });
      saveTitle(inputValue, option, tab);
    }
  }, [inputValue, option, tab]);

  const domain = extractDomain(tab?.url);

  return (
    <div className={styles.root}>
      <Gear />
      <CurrentTitle
        currentTitle={tab?.title}
        setInputValue={setInputAndSelect}
      />
      <BookmarkTitle url={tab?.url} setInputValue={setInputAndSelect} />
      <TextField
        multiline
        className={styles.input}
        inputRef={inputRef}
        label="New Title"
        value={inputValue}
        onKeyPress={(e: any) => {
          if (e.which == 13 && !e.shiftKey) {
            e.preventDefault();
            setTitle();
            return false;
          }
        }}
        onChange={(e: any) => setInputValue(e.target.value)}
        onFocus={(e: any) => e.target.select()}
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
            value="tablock"
            control={<Radio color="primary" />}
            label="Set for this tab"
          />
          <FormControlLabel
            value="exact"
            control={<Radio color="primary" />}
            label="Set for this exact URL"
          />
          <FormControlLabel
            value="domain"
            control={<Radio color="primary" />}
            label={`Set for this domain: ${domain}`}
            disabled={!domain}
          />
        </RadioGroup>
      </FormControl>
      <Button
        className={styles.button}
        variant="contained"
        color="primary"
        onClick={setTitle}
      >
        SET TITLE
      </Button>
      <div className={styles.version}>v{EXTENSION_VERSION}</div>
    </div>
  );
};

export default Form;
