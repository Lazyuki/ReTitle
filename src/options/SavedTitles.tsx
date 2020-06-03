import { h } from 'preact';
import { useState, useEffect, useCallback, useMemo } from 'preact/compat';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
  StorageChanges,
  TabLockTitle,
  ExactTitle,
  DomainTitle,
  RegexTitle,
} from '../shared/types';
import { storageChangeHandler, getTitles } from '../shared/StorageHandler';

const noop = () => {};

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
}));

const SavedTitles = () => {
  const styles = useStyles();
  const [tabLocks, setTablocks] = useState<TabLockTitle[]>([]);
  const [exacts, setExacts] = useState<ExactTitle[]>([]);
  const [domains, setDomains] = useState<DomainTitle[]>([]);
  const [regexes, setRegexes] = useState<RegexTitle[]>([]);

  const onTablockChange = useCallback((tablock: TabLockTitle) => {
    if (tablock.newTitle) {
      setTablocks((p) => [...p, tablock]);
    } else {
      // remove
      setTablocks((p) => [...p]);
    }
  }, []);

  const onExactChange = useCallback((exact: ExactTitle) => {
    setExacts((p) => [...p, exact]);
  }, []);

  const onDomainChange = useCallback((domain: DomainTitle) => {
    setDomains((p) => [...p, domain]);
  }, []);

  const onRegexChange = useCallback((regex: RegexTitle) => {
    setRegexes((p) => [...p, regex]);
  }, []);

  useEffect(() => {
    const handler = storageChangeHandler({
      onTablockChange,
      onExactChange,
      onDomainChange,
      onRegexChange,
    });
    getTitles({
      onTablockChange,
      onExactChange,
      onDomainChange,
      onRegexChange,
    });
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  return (
    <div>
      <ul class="description">
        <li>
          Use <code>$0</code> to insert the original title. So if you want
          <code>Title</code> to say <code>Good Title</code>, set the title name
          to <code>Good $0</code>.
        </li>
      </ul>
      <h4>Tabs</h4>
      <List className={styles.root}>
        {tabLocks.map((t) => {
          return (
            <ListItem button>
              <ListItemText
                primary={`Tab ID: ${t.tabId} | Title: ${t.newTitle}`}
              />
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
            </ListItem>
          );
        })}
      </List>
      <h4>Exact URLs</h4>
      <List className={styles.root}>
        {exacts.map((t) => {
          return (
            <ListItem button>
              <ListItemText primary={`URL: ${t.url} | Title: ${t.newTitle}`} />
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
            </ListItem>
          );
        })}
      </List>
      <h4>Domains</h4>
      <List className={styles.root}>
        {domains.map((t) => {
          return (
            <ListItem button>
              <ListItemText
                primary={`Domain: ${t.domain} | Title: ${t.newTitle}`}
              />
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
            </ListItem>
          );
        })}
      </List>
      <h4>Regexes</h4>
      <List className={styles.root}>
        {regexes.map((t) => {
          return (
            <ListItem button>
              <ListItemText
                primary={`Regex: ${t.regex} | Title: ${t.newTitle}`}
              />
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

export default SavedTitles;
