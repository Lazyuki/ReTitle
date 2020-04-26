import { h, JSX } from 'preact';
import { useEffect, useState } from 'preact/compat';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
    marginBottom: '10px',
    marginRight: '40px',
  },
  label: {
    opacity: 0.7,
    fontSize: '12px',
  },
  span: {
    fontSize: '14px',
  },
});

const BookmarkTitle = ({
  url,
  setInputValue,
  ...rest
}: {
  url?: string;
  setInputValue: (value: string) => void;
} & JSX.HTMLAttributes<HTMLSpanElement>) => {
  const [bookmarkedTitle, setBookmarkedTitle] = useState<string | null>(null);
  const styles = useStyles();

  useEffect(() => {
    if (url) {
      try {
        chrome.bookmarks.search({ url }, function (results) {
          if (results[0]) {
            setBookmarkedTitle(results[0].title);
          }
        });
      } catch (e) {
        // URL not allowed;
      }
    }
  }, [url]);
  return bookmarkedTitle !== null ? (
    <Tooltip title="Paste bookmark title" arrow>
      <div
        className={styles.root}
        onClick={() => setInputValue(bookmarkedTitle)}
      >
        <span className={styles.label}>From Bookmark </span>
        <span {...rest} className={styles.span}>
          {bookmarkedTitle}
        </span>
      </div>
    </Tooltip>
  ) : null;
};

export default BookmarkTitle;
