import { h } from 'preact';
import { makeStyles } from '@material-ui/core/styles';
import gearImg from '../../static/images/gear.png';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    zIndex: 2,
    top: '10px',
    right: '10px',
    display: 'block',
    cursor: 'pointer',
    width: '25px',
    height: '25px',
    transition: 'transform 0.3s ease-in -out',
    '&: hover': {
      transform: 'rotate(60deg)',
    },
  },
});

const Gear = () => {
  const styles = useStyles();
  return (
    <img
      className={styles.root}
      src={gearImg}
      onClick={() => chrome.runtime.openOptionsPage(() => window.close())}
    />
  );
};

export default Gear;
