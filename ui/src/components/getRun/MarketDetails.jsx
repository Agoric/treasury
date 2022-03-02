/* eslint-disable no-unused-vars */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { makeRatio, invertRatio } from '@agoric/zoe/src/contractSupport';
import { NameValueTable, makeRow } from './NameValueTable';
import { makeDisplayFunctions } from '../helpers';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing(4),
    borderRadius: '20px',
    color: '#707070',
    fontSize: '22px',
    lineHeight: '27px',
    padding: theme.spacing(4),
    minWidth: 360,
    height: 228,
  },
  title: {
    fontSize: '22px',
  },
  break: {
    border: 0,
    height: '1px',
    background: '#E5E5E5',
  },
  loadingPlaceholder: {
    height: '126px',
    display: 'flex',
    alignItems: 'center',
    margin: 'auto',
    width: 'fit-content',
  },
}));

const MarketDetails = ({
  brandToInfo,
  collateralPrice,
  collateralizationRatio,
}) => {
  const classes = useStyles();
  const { displayPercent, displayRatio } = makeDisplayFunctions(brandToInfo);

  const borrowLimit =
    collateralPrice &&
    collateralizationRatio &&
    makeRatio(
      collateralPrice.denominator.value *
        collateralizationRatio.denominator.value,
      collateralPrice.numerator.brand,
      collateralPrice.numerator.value * collateralizationRatio.numerator.value,
      collateralPrice.denominator.brand,
    );

  const rows =
    collateralPrice && collateralizationRatio
      ? [
          makeRow(
            'BLD Price',
            `${displayRatio(invertRatio(collateralPrice))} RUN`,
          ),
          makeRow(
            'Min BLD:RUN Ratio',
            `${displayPercent(collateralizationRatio)}%`,
          ),
          makeRow('Borrow Limit per BLD', `${displayRatio(borrowLimit)} RUN`),
        ]
      : [];
  const values =
    !collateralPrice || !collateralizationRatio ? (
      <div className={classes.loadingPlaceholder}>
        <CircularProgress />
      </div>
    ) : (
      <NameValueTable rows={rows} />
    );

  return (
    <Paper className={classes.root} elevation={4}>
      <Typography className={classes.title}>Economy Details</Typography>
      <hr className={classes.break} />
      {values}
    </Paper>
  );
};

export default MarketDetails;