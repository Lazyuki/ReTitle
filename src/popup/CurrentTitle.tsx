import { h, JSX } from 'preact';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
    marginBottom: '10px',
    marginRight: '60px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  label: {
    opacity: 0.7,
    fontSize: '12px',
  },
  span: {
    fontSize: '14px',
  },
});

const CurrentTitle = ({
  currentTitle,
  setInputValue,
  ...rest
}: {
  currentTitle?: string;
  setInputValue: (value: string) => void;
} & JSX.HTMLAttributes<HTMLSpanElement>) => {
  const styles = useStyles();

  return (
    <Tooltip
      title={`Click to paste current title: ${currentTitle}`}
      placement="bottom-start"
    >
      <div
        className={styles.root}
        onClick={() => setInputValue(currentTitle || '')}
      >
        <span className={styles.label}>Current Title </span>
        <span {...rest} className={styles.span}>
          {currentTitle}
        </span>
      </div>
    </Tooltip>
  );
};

export default CurrentTitle;
