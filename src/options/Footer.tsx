import { h } from 'preact';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';

import ChromeIcon from '../../static/svgs/chrome.svg';
import FirefoxIcon from '../../static/svgs/firefox.svg';
import GitHubIcon from '../../static/svgs/github.svg';

const isChrome = BROWSER === 'chrome';

const chipProps = {
  size: 'small',
  clickable: true,
  color: 'primary',
  component: 'a',
  variant: 'outlined',
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: '0.8em',
    background: 'black',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  links: {
    margin: '10px 0',
    '& > *': {
      margin: '0 10px',
    },
    '& svg': {
      height: '1.2em',
    },
  },
  copyRight: {
    flex: 1,
    textAlign: 'right',
    marginRight: '20px',
  },
}));

const Chrome = (
  <Chip
    icon={<ChromeIcon />}
    label={isChrome ? 'Rate Me!' : 'Chrome'}
    href="https://chrome.google.com/webstore/detail/tab-retitle/hilgambgdpjgljhjdaccadahckpdiapo"
    {...chipProps}
  />
);
const Firefox = (
  <Chip
    icon={<FirefoxIcon />}
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
      <Container maxWidth="lg" className={styles.container}>
        <div className={styles.links}>
          {links}
          <Chip
            icon={<GitHubIcon />}
            label="GitHub"
            href="https://github.com/Lazyuki/ReTitle"
            {...chipProps}
          />
        </div>
        <div className={styles.copyRight}>&copy; 2021 Lazyuki</div>
      </Container>
    </footer>
  );
};

export default Footer;
