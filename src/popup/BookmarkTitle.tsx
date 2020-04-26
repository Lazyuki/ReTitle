import { h, JSX } from 'preact';
import { useEffect, useState } from 'preact/compat';
import Tooltip from '@material-ui/core/Tooltip';

const BookmarkTitle = ({ url, setInputValue, ...rest }: { url?: string; setInputValue: (value: string) => void } & JSX.HTMLAttributes<HTMLSpanElement>) => {
  const [bookmarkedTitle, setBookmarkedTitle] = useState('');
  useEffect(() => {
    if (url) {
      try {
        chrome.bookmarks.search({ url }, function (results) {
          if (results?.[0]) {
            setBookmarkedTitle(results[0].title || '');
          }
        });
      } catch (e) {
        // URL not allowed;
      }
    }

  }, [url]);
  return bookmarkedTitle ? (<div data-position="bottom" data-tooltip="Paste bookmark title">
    <Tooltip title="Paste old title" placement='bottom'>
      <span onClick={() => setInputValue(bookmarkedTitle)} {...rest}>From bookmark: {bookmarkedTitle}</span>
    </Tooltip>
  </div>) : null;
}

export default BookmarkTitle;