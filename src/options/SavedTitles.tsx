import { h } from 'preact';
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  StateUpdater,
} from 'preact/compat';
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
  StorageAction,
  StoredTitle,
} from '../shared/types';
import { storageChangeHandler, initTitles } from '../shared/storageHandler';

const noop = () => {};

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
}));

const editTitleState = <T extends StoredTitle>(
  predicate: (title: T) => boolean,
  newTitle: T
) => (previous: T[]) => {
  const index = previous.findIndex(predicate);
  if (index >= 0) {
    const copy = [...previous];
    copy[index] = newTitle;
    return copy;
  } else {
    return previous;
  }
};
const removeTitleState = <T extends StoredTitle>(
  predicate: (title: T) => boolean
) => (previous: T[]) => {
  const index = previous.findIndex(predicate);
  if (index >= 0) {
    const copy = [...previous].splice(index, 1);
    return copy;
  } else {
    return previous;
  }
};

const generateCallback = <T extends StoredTitle>(
  stateUpdater: StateUpdater<T[]>,
  predicate: (t1: T, t2: T) => boolean
) => (action: StorageAction, newTitle: T) => {
  switch (action) {
    case 'add':
      stateUpdater((p) => [...p, newTitle]);
      break;
    case 'remove':
      stateUpdater(removeTitleState((t) => predicate(t, newTitle)));
    case 'edit':
      stateUpdater(editTitleState((t) => predicate(t, newTitle), newTitle));
  }
};

const SavedTitles = () => {
  const styles = useStyles();
  const [tabLocks, setTablocks] = useState<TabLockTitle[]>([]);
  const [exacts, setExacts] = useState<ExactTitle[]>([]);
  const [domains, setDomains] = useState<DomainTitle[]>([]);
  const [regexes, setRegexes] = useState<RegexTitle[]>([]);

  const onTablockChange = useCallback(
    generateCallback(setTablocks, (t1, t2) => t1.tabId === t2.tabId),
    []
  );

  const onExactChange = useCallback(
    generateCallback(setExacts, (t1, t2) => t1.url === t2.url),
    []
  );

  const onDomainChange = useCallback(
    generateCallback(setDomains, (t1, t2) => t1.domain === t2.domain),
    []
  );

  const onRegexChange = useCallback(
    generateCallback(setRegexes, (t1, t2) => t1.urlPattern === t2.urlPattern),
    []
  );

  useEffect(() => {
    const handler = storageChangeHandler({
      onTablockChange,
      onExactChange,
      onDomainChange,
      onRegexChange,
    });
    initTitles({
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
        <li>Temporary titles are not shown here</li>
        <li>
          Use <code>$0</code> to insert the original title. So if you want
          <code>Title</code> to say <code>My Title</code>, set the title name to{' '}
          <code>My $0</code>.
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
              <ListItemIcon>
                <DeleteIcon />
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
              <ListItemIcon>
                <DeleteIcon />
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
              <ListItemIcon>
                <DeleteIcon />
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
                primary={`Regex: ${t.urlPattern} | Title: ${t.newTitle}`}
              />
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
