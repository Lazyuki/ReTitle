import { h } from 'preact';
import { makeStyles } from '@material-ui/core/styles';
import AccessibleButton from '../shared/AccessibleButton';
import ReplayIcon from '@material-ui/icons/Replay';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    zIndex: 2,
    top: '10px',
    right: '40px',
    cursor: 'pointer',
    width: '35px',
    height: '35px',
    padding: '5px',
    color: '#ff3333',
    '& svg': {
      willChange: 'opacity, transform',
      opacity: 0.7,
      transition: 'all 0.3s ease-in-out',
    },
    '&:hover svg': {
      transform: 'rotate(-45deg)',
      opacity: 1,
    },
  },
});

const Revert = ({ tabId }: { tabId: number }) => {
  const styles = useStyles();
  return (
    <Tooltip title={'Restore original title temporarily'} enterDelay={300}>
      <AccessibleButton
        className={styles.root}
        onClick={() =>
          chrome.runtime.sendMessage({
            type: 'revert',
            tabId,
          })
        }
      >
        <ReplayIcon />
      </AccessibleButton>
    </Tooltip>
  );
};

export default Revert;
