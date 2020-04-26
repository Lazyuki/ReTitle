import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/compat'
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

import pkg from '../../package.json';

import Gear from './Gear';
import OriginalTitle from './OriginalTitle';
import BookmarkTitle from './BookmarkTitle';

type TabOption = 'onetime' | 'tablock' | 'exact' | 'fulldomain' | 'domain';

const App = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);
  const [option, setOption] = useState<TabOption>('onetime');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const initialize = (tabs: chrome.tabs.Tab[]) => {
      const currentTab = tabs[0];
      setTab(currentTab);
      setInputValue(currentTab.title || '');
      chrome.storage.sync.get('options', (items) => {
        if (items['options']) {
          const options = items['options'];
          if (options.domain) setOption('domain');
          if (options.onetime) setOption('onetime')
          if (options.tablock) setOption('tablock')
          if (options.exact) setOption('exact')
        }
      });
      setTimeout(() => {
        inputRef?.current?.select();
      }, 0);
    };
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, initialize);
  }, []);

  const handleOptionChange = useCallback((e: any) => {
    setOption(e.target.value);
  }, []);

  return (
    <PopupContainer>
      <Gear />
      <OriginalTitle currentTitle={tab?.title} setInputValue={setInputValue} />
      <BookmarkTitle url={tab?.url} setInputValue={setInputValue} />
      <TextField multiline inputRef={inputRef} label="New Title" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onFocus={(e) => e.target.select()} />
      <FormControl component="fieldset">
        <RadioGroup aria-label="option" name="option" value={option} onChange={handleOptionChange}>
          <FormControlLabel value="onetime" control={<Radio />} label="Set it temporarily" />
          <FormControlLabel value="tab" control={<Radio />} label="Set for this tab*" />
          <FormControlLabel value="exact" control={<Radio />} label="Set for this exact URL" />
          <FormControlLabel value="domain" control={<Radio />} label={`Set for this domain: ${tab?.url}`} />
        </RadioGroup>
      </FormControl>
      <Button variant="contained" color="primary">
        Set Title
      </Button>
      <div id="version">v{pkg.version}</div>
    </PopupContainer>
  )
}
export default App;

const PopupContainer = styled.div`
  width: 400px;
  padding: 10px;
  .MuiTextField-root {
    width: 100%;
  }

  #version {
    text-align: right;
    opacity: 0.5;
    font-size: 12px;
  }
`
