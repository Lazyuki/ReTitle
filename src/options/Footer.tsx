import { h } from 'preact';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

import ChromeIcon from '../../static/svgs/chrome.svg';
import FirefoxIcon from '../../static/svgs/firefox.svg';
import GitHubIcon from '../../static/svgs/github.svg';

// Determined by webpack
let isChrome = true;
// #if process.env.BROWSER === 'firefox'
isChrome = false;
// #endif

const chipProps = {
  size: 'small',
  clickable: true,
  color: 'primary',
  component: 'a',
  variant: 'outlined',
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

const useStyles = makeStyles({
  root: {
    fontSize: '0.8em',
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0',
    '& > *': {
      margin: '0 10px',
    },
    '& svg': {
      height: '1.2em',
    },
  },
  copyRight: {
    textAlign: 'center',
  },
});

const Chrome = (
  <Chip
    icon={(<ChromeIcon />) as any}
    label={isChrome ? 'Rate Me!' : 'Chrome'}
    href="https://chrome.google.com/webstore/detail/tab-retitle/hilgambgdpjgljhjdaccadahckpdiapo"
    {...chipProps}
  />
);
const Firefox = (
  <Chip
    icon={(<FirefoxIcon />) as any}
    label={isChrome ? 'Firefox' : 'Rate Me!'}
    href="https://addons.mozilla.org/en-US/firefox/addon/tab-retitle/"
    {...chipProps}
  />
);

const Footer = () => {
  const styles = useStyles();
  const links = isChrome ? [Chrome, Firefox] : [Firefox, Chrome];

  return (
    <footer className={styles.root}>
      <div className={styles.links}>
        {links}
        <Chip
          icon={(<GitHubIcon />) as any}
          label="GitHub"
          href="https://github.com/Lazyuki/ReTitle"
          {...chipProps}
        />
      </div>
      <div className={styles.copyRight}>&copy; 2020 Lazyuki</div>
    </footer>
  );
};

export default Footer;
