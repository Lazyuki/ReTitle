import { h } from 'preact';
import { FC } from 'preact/compat';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    background: 'black',
    color: 'white',
  },
  title: {
    margin: '10px 0',
    fontSize: '2em',
  },
}));

const Header: FC = ({ children }) => {
  const styles = useStyles();

  return (
    <AppBar className={styles.root}>
      <Container maxWidth="lg">
        <Typography variant="h6" className={styles.title}>
          ReTitle Settings
        </Typography>
        {children}
      </Container>
    </AppBar>
  );
};

export default Header;
