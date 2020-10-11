import { h } from 'preact';
import { useState } from 'preact/compat';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import Header from './Header';
import SavedTitles from './SavedTitles';
import UserSettings from './UserSettings';
import Footer from './Footer';
import AdvancedSettings from './AdvancedSettings';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  main: {
    flex: '1',
    overflow: 'auto',
  },
  tabRoot: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: 224,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: any;
  index: number;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const Home = () => {
  const styles = useStyles();
  const [tab, setTab] = useState(0);

  const handleChange = (event: any, newValue: number) => {
    setTab(newValue);
  };

  return (
    <div className={styles.root}>
      <Header>
        <Tabs value={tab} onChange={handleChange} aria-label="tabs">
          <Tab label="Saved Titles" {...a11yProps(0)} />
          <Tab label="User Settings" {...a11yProps(1)} />
          <Tab label="Advanced Settings" {...a11yProps(2)} />
        </Tabs>
      </Header>
      <main className={styles.main}>
        <Container maxWidth="lg">
          <TabPanel value={tab} index={0}>
            <SavedTitles />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <UserSettings />
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <AdvancedSettings />
          </TabPanel>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
