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
import { storageChangeHandler } from '../shared/StorageHandler';

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

  const handleTablock = useCallback((tablock: TabLockTitle) => {
    if (tablock.newTitle) {
      setTablocks((p) => [...p, tablock]);
    } else {
      // remove
      setTablocks((p) => [...p]);
    }
  }, []);

  const handleExact = useCallback((exact: ExactTitle) => {
    setExacts((p) => [...p, exact]);
  }, []);

  const handleDomain = useCallback((domain: DomainTitle) => {
    setDomains((p) => [...p, domain]);
  }, []);

  const handleRegex = useCallback((regex: RegexTitle) => {
    setRegexes((p) => [...p, regex]);
  }, []);

  useEffect(() => {
    const handler = storageChangeHandler(
      noop,
      noop,
      handleTablock,
      handleExact,
      handleDomain,
      handleRegex
    );
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  return (
    <div>
      <ul class="description">
        <li>
          URLs like <code>*example.com*</code> are set for the domain.
        </li>
        <li>
          Use <code>$0</code> to insert the original title. So if you want
          <code>Title</code> to say <code>Good Title</code>, set the title name
          to <code>Good $0</code>.
        </li>
      </ul>
      <List component="nav" className={styles.root}>
        {tabLocks.map((t) => {
          return (
            <ListItem button>
              <ListItemText primary={t.newTitle} />
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

export default SavedTitles;
