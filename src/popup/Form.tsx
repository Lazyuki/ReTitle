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

function saveTitle(
  newTitle: string,
  option: TabOption,
  currentTab: chrome.tabs.Tab
) {
  if (option === 'tablock') {
    const obj: { [key: string]: object } = {};
    obj[`Tab#${currentTab.id}`] = { title: newTitle };
    chrome.storage.sync.set(obj, () => window.close());
    return;
  } else if (option !== 'onetime') {
    setStorage(newTitle, option === 'domain', currentTab);
  }
  window.close();
}

function setStorage(
  newTitle: string,
  domain: boolean,
  currentTab: chrome.tabs.Tab
) {
  const url = currentTab.url;
  if (!url) return; // No URL?
  const obj: { [key: string]: object } = {};
  if (domain) {
    // only for domain
    const urlDomain = extractDomain(url);
    obj[`*${urlDomain}*`] = { title: newTitle };
  } else {
    // is exact
    obj[url] = { title: newTitle };
  }
  chrome.storage.sync.set(obj, () => window.close());
}

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
      chrome.storage.sync.get('options', (items) => {
        if (items['options']) {
          const options = items['options'];
          if (options.domain) setOption('domain');
          if (options.onetime) setOption('onetime');
          if (options.tablock) setOption('tablock');
          if (options.exact) setOption('exact');
        }
      });
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
            value="tab"
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
            label={`Set for this domain: ${extractDomain(tab?.url)}`}
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
