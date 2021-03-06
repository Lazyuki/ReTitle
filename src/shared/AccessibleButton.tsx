import { h, JSX, FunctionComponent as FC } from 'preact';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    appearance: 'none',
    background: 'none',
    border: 'none',

    '&:hover': {
      outline: 'none',
    },
    color: theme.palette.text.primary,
  },
}));

const AccessibleButton: FC<JSX.HTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...rest
}) => {
  const styles = useStyles();
  return <button className={clsx(styles.root, className)} {...rest} />;
};

export default AccessibleButton;
