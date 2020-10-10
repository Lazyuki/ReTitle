import { h } from 'preact';
import { makeStyles } from '@material-ui/core/styles';
import GearSvg from '../../static/svgs/gear.svg';
import AccessibleButton from '../shared/AccessibleButton';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    zIndex: 2,
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    width: '35px',
    height: '35px',
    padding: '5px',
    '& svg': {
      willChange: 'opacity, transform',
      opacity: 0.7,
      transition: 'all 0.3s ease-in-out',
    },
    '&:hover svg': {
      transform: 'rotate(60deg)',
      opacity: 1,
    },
  },
});

const Gear = () => {
  const styles = useStyles();
  return (
    <AccessibleButton
      className={styles.root}
      onClick={() => chrome.runtime.openOptionsPage(() => window.close())}
    >
      <GearSvg />
    </AccessibleButton>
  );
};

export default Gear;
