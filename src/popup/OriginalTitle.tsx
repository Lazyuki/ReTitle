import { h, JSX } from 'preact';

import Tooltip from '@material-ui/core/Tooltip';

const OriginalTitle = ({ currentTitle, setInputValue, ...rest }: { currentTitle?: string; setInputValue: (value: string) => void } & JSX.HTMLAttributes<HTMLSpanElement>) => {
  return currentTitle ? (<div data-position="bottom" data-tooltip="Paste old title">
    <Tooltip title="Paste old title" placement='bottom'>
      <span onClick={() => setInputValue(currentTitle || '')} {...rest}>{currentTitle}</span>
    </Tooltip>
  </div>) : null;
}

export default OriginalTitle;