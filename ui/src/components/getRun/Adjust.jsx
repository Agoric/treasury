/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';

import { AmountMath } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import { makeRatio } from '@agoric/zoe/src/contractSupport';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { filterPurses } from '@agoric/ui-components';
import TextField from '@material-ui/core/TextField';

import ApproveOfferSB from '../ApproveOfferSB';
import ConfirmOfferTable from './ConfirmOfferTable';
import GetStarted from './GetStarted';
import NatPurseAmountInput from '../vault/VaultManagement/NatPurseAmountInput';
import { adjust } from '../../runLoCStub';
import { icons, defaultIcon } from '../../utils/icons';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing(4),
    borderRadius: '20px',
    color: '#707070',
    fontSize: '22px',
    lineHeight: '27px',
    padding: theme.spacing(4),
    paddingTop: theme.spacing(2),
    height: '100%',
  },
  settingsToolbar: {
    minHeight: '48px',
    paddingLeft: '20px',
  },
  toolbarIcon: {
    marginRight: theme.spacing(1),
  },
  buttons: {
    marginTop: theme.spacing(1),
  },
  actionChoices: {
    marginBottom: theme.spacing(3),
    maxHeight: '40px',
  },
  button: {
    color: 'white',
  },
  infoText: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  title: {
    fontSize: '22px',
  },
  tabsRoot: {
    flexGrow: 1,
  },
  break: {
    border: 0,
    height: '1px',
    background: '#E5E5E5',
  },
  step: {
    marginBottom: theme.spacing(3),
  },
  stepTitle: {
    fontSize: '18px',
    color: '#707070',
    marginBottom: theme.spacing(2),
  },
  adjustCollateral: {
    paddingBottom: theme.spacing(3),
  },
  adjustDebt: {
    paddingBottom: theme.spacing(3),
  },
  checkboxLabel: {
    fontSize: '16px',
    color: '#222222',
  },
  form: {
    marginTop: theme.spacing(4),
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 'fit-content',
  },
  confirm: {
    marginTop: theme.spacing(4),
  },
  bldPurseSelector: {
    display: 'flex',
    flexDirection: 'row',
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: 4,
    paddingTop: 8,
    paddingBottom: 6,
    paddingLeft: 6,
    paddingRight: 10,
    width: 'fit-content',
    boxSizing: 'border-box',
    marginRight: 8,
  },
  bldPurseIcon: {
    marginRight: 8,
  },
  bldPurse: {
    fontSize: 16,
    lineHeight: '18px',
  },
  bldBalance: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  stakedAmount: {
    fontSize: 14,
    lineHeight: '16px',
    color: 'rgba(0, 0, 0, 0.54)',
  },
  collateralForm: {
    display: 'flex',
    flexDirection: 'row',
  },
  bldPurseLabel: {
    position: 'absolute',
    background: '#fff',
    fontSize: 12,
    lineHeight: '12px',
    marginTop: '-14px',
    marginLeft: '4px',
    padding: '0 4px',
    color: 'rgba(0, 0, 0, 0.56)',
  },
}));

const Adjust = ({
  purses,
  brandToInfo,
  brand,
  debtBrand,
  locked,
  borrowed,
  collateralization,
  runPercent,
  marketPrice,
  accountState,
}) => {
  const [runPurseSelected, setRunPurseSelected] = useState(null);
  const [collateralAction, setCollateralAction] = useState('lock');
  const [debtAction, setDebtAction] = useState('borrow');
  const [debtDelta, setDebtDelta] = useState(null);
  const [lockedDelta, setLockedDelta] = useState(null);
  const [getStartedClicked, setGetStartedClicked] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [openApproveOfferSB, setOpenApproveOfferSB] = useState(false);
  const classes = useStyles();

  const hasLockedBld = locked?.numerator?.value > 0;

  const handleTabChange = (_, newTab) => {
    setCurrentTab(newTab);
  };

  const handleApproveOfferSBClose = () => {
    setOpenApproveOfferSB(false);
  };

  useEffect(() => {
    setDebtDelta(null);
    setLockedDelta(null);
    if (currentTab === 0) {
      setCollateralAction('lock');
      setDebtAction('borrow');
    } else {
      setCollateralAction('unlock');
      setDebtAction('repay');
    }
  }, [currentTab]);

  if (!purses || !brand || !debtBrand || !accountState) {
    return (
      <div>
        <Paper elevation={3} className={classes.root}>
          <Grid container>
            <GetStarted />
          </Grid>
        </Paper>
      </div>
    );
  }

  if (!hasLockedBld && !getStartedClicked) {
    return (
      <Paper elevation={3} className={classes.root}>
        <GetStarted onGetStarted={() => setGetStartedClicked(true)} />
      </Paper>
    );
  }

  const bldPurses = filterPurses(purses, brand);
  // TODO: find a better way to identify the staking purse.
  const bldStakingPurse = bldPurses.length > 0 ? bldPurses[0] : null;

  const handleCollateralAmountChange = value => {
    const newLockedDelta = AmountMath.make(brand, value);
    setLockedDelta(newLockedDelta);
  };

  const handleDebtAmountChange = value => {
    const newDebtDelta = AmountMath.make(debtBrand, value);
    setDebtDelta(newDebtDelta);
  };

  const adjustCollateral = (
    <Grid item className={classes.step}>
      <Typography variant="h6" className={classes.stepTitle}>
        {collateralAction === 'lock' ? 'Lock BLD' : 'Unlock BLD'}
      </Typography>
      <div className={classes.collateralForm}>
        <div className={classes.bldPurseSelector}>
          <div className={classes.bldPurseLabel}>Purse</div>
          <img
            className={classes.bldPurseIcon}
            alt="icon"
            src={icons[new Map(brandToInfo).get(brand).petname] ?? defaultIcon}
            height="40px"
            width="40px"
          />
          <div className={classes.bldBalance}>
            <div className={classes.bldPurse}>
              {bldStakingPurse.pursePetname}
            </div>
            <div className={classes.stakedAmount}>5.04 Staked</div>
          </div>
        </div>
        <TextField
          label="Amount"
          variant="outlined"
          inputProps={{
            'aria-label': '13 stakedunlocked',
          }}
        />
      </div>
    </Grid>
  );

  const adjustDebt = (
    <Grid item className={classes.step}>
      <Typography variant="h6" className={classes.stepTitle}>
        {debtAction === 'borrow' ? 'Borrow RUN' : 'Repay RUN Debt'}
      </Typography>
      <NatPurseAmountInput
        purses={purses}
        purseSelected={runPurseSelected}
        amountValue={debtDelta && debtDelta.value}
        onPurseChange={setRunPurseSelected}
        onAmountChange={handleDebtAmountChange}
        brandToFilter={debtBrand}
        brandToInfo={brandToInfo}
      />
    </Grid>
  );

  const makeOffer = async () => {
    setDebtDelta(null);
    setLockedDelta(null);
    setOpenApproveOfferSB(true);

    const [displayInfo, debtDisplayInfo] = await Promise.all([
      E(brand).getDisplayInfo(),
      E(debtBrand).getDisplayInfo(),
    ]);

    const collateralAmount =
      (lockedDelta ?? AmountMath.makeEmpty(brand)).value /
      10n ** BigInt(displayInfo.decimalPlaces - 2);
    const adjustCollateralRatio = brand && makeRatio(collateralAmount, brand);

    const debtAmount =
      (debtDelta ?? AmountMath.makeEmpty(debtBrand)).value /
      10n ** BigInt(debtDisplayInfo.decimalPlaces - 2);
    const adjustDebtRatio = debtBrand && makeRatio(debtAmount, debtBrand);

    adjust(
      adjustCollateralRatio,
      adjustDebtRatio,
      collateralAction,
      debtAction,
    );
  };

  return (
    <>
      <Paper elevation={3} className={classes.root}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Borrow" />
          <Tab label="Repay" />
        </Tabs>
        <Grid className={classes.form} container direction="column">
          {adjustCollateral}
          {adjustDebt}
        </Grid>
        {locked && borrowed && (lockedDelta || debtDelta) && (
          <div className={classes.confirm}>
            <hr className={classes.break} />
            <Grid
              container
              spacing={1}
              className={classes.buttons}
              justify="space-evenly"
              alignItems="center"
            >
              <Grid item>
                <ConfirmOfferTable
                  locked={locked}
                  borrowed={borrowed}
                  lockedDelta={lockedDelta}
                  debtDelta={debtDelta}
                  brandToInfo={brandToInfo}
                  collateralization={collateralization}
                  collateralAction={collateralAction}
                  debtAction={debtAction}
                  runPercent={runPercent}
                  marketPrice={marketPrice}
                />
              </Grid>
              <Grid item>
                <Button
                  onClick={() => makeOffer()}
                  className={classes.button}
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                >
                  Make Offer
                </Button>
              </Grid>
            </Grid>
          </div>
        )}
      </Paper>
      <ApproveOfferSB
        open={openApproveOfferSB}
        handleClose={handleApproveOfferSBClose}
      />
    </>
  );
};

export default Adjust;