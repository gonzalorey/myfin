import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { Trans, useTranslation } from 'react-i18next';
import React, { useEffect, useReducer } from 'react';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Button from '@mui/material/Button/Button';
import { Euro, Send, Undo } from '@mui/icons-material';
import { useUpdateAssetValue } from '../../services/invest/investHooks.ts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent/DialogContent';
import TextField from '@mui/material/TextField/TextField';
import DialogActions from '@mui/material/DialogActions/DialogActions';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';

type UiState = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  assetId: bigint;
  value: number;
  assetName: string;
};

const enum StateActionType {
  RequestStarted,
  RequestSuccess,
  RequestError,
  AmountUpdated,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.RequestError }
  | { type: StateActionType.AmountUpdated; payload: number };

const createInitialState = (args: {
  currentValue: number;
  assetId: bigint;
  assetName: string;
}): UiState => {
  return {
    isLoading: false,
    isError: false,
    errorMessage: null,
    value: args.currentValue,
    assetId: args.assetId,
    assetName: args.assetName,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.RequestSuccess:
    case StateActionType.RequestError:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.AmountUpdated:
      return {
        ...prevState,
        value: action.payload,
      };
  }
};

type Props = {
  isOpen: boolean;
  onSuccess: () => void;
  onCanceled: () => void;
  assetId: bigint;
  currentValue: number;
  assetName: string;
};

const UpdateAssetValueDialog = (props: Props) => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(
    reduceState,
    {
      assetName: props.assetName,
      currentValue: props.currentValue,
      assetId: props.assetId,
    },
    createInitialState,
  );

  const updateAssetValueRequest = useUpdateAssetValue();

  // Loading
  useEffect(() => {
    if (state.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [state.isLoading]);

  // Error
  useEffect(() => {
    if (state.isError) {
      dispatch({ type: StateActionType.RequestError });
      snackbar.showSnackbar(
        state.errorMessage
          ? state.errorMessage
          : t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [state.isError, state.errorMessage]);

  useEffect(() => {
    if (updateAssetValueRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [updateAssetValueRequest.isError]);

  // Success
  useEffect(() => {
    if (!updateAssetValueRequest.data) return;
    dispatch({ type: StateActionType.RequestSuccess });
    snackbar.showSnackbar(
      t('investments.updateValueSuccess'),
      AlertSeverity.SUCCESS,
    );
    props.onSuccess();
  }, [updateAssetValueRequest.data]);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onCanceled}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          updateAssetValueRequest.mutate({
            assetId: state.assetId,
            newValue: state.value,
          });
        },
      }}
    >
      <DialogTitle>
        <Trans
          i18nKey={'investments.currentInvestValue'}
          values={{
            name: props.assetName,
          }}
        />
      </DialogTitle>
      <DialogContent>
        <Grid xs={12} md={3}>
          <TextField
            autoFocus
            required
            margin="dense"
            id="amount"
            name="amount"
            value={state.value || ''}
            onChange={(e) =>
              dispatch({
                type: StateActionType.AmountUpdated,
                payload: Number(e.target.value),
              })
            }
            label={t('common.value')}
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{
              step: 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Euro />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pr: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Undo />}
          onClick={props.onCanceled}
        >
          {t('common.cancel')}
        </Button>
        <Button variant="contained" startIcon={<Send />} type="submit">
          {t('common.edit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateAssetValueDialog;
