import { useTranslation, Trans } from 'react-i18next';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../../components/PageHeader.tsx';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  addLeadingZero,
  formatNumberAsCurrency,
} from '../../../utils/textUtils.ts';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CardActions from '@mui/material/CardActions';
import Paper from '@mui/material/Paper/Paper';
import {
  Card,
  Divider,
  linearProgressClasses,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Button from '@mui/material/Button/Button';
import {
  AddReaction,
  AddReactionOutlined,
  Description,
  Euro,
  FileCopy,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import IconButton from '@mui/material/IconButton';
import { useParams } from 'react-router-dom';
import { useGetBudget } from '../../../services/budget/budgetHooks.ts';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { BudgetCategory } from '../../../services/budget/budgetServices.ts';
import Typography from '@mui/material/Typography/Typography';
import Stack from '@mui/material/Stack/Stack';
import styled from '@mui/material/styles/styled';
import LinearProgress from '@mui/material/LinearProgress/LinearProgress';
import Container from '@mui/material/Container/Container';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { cssGradients } from '../../../utils/gradientUtils.ts';
import { ColorGradient } from '../../../consts';
import Chip from '@mui/material/Chip/Chip';

const BudgetDetails = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const matchesSmScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const { id } = useParams();
  const getBudgetRequest = useGetBudget(BigInt(id ?? -1));
  const [monthYear, setMonthYear] = useState({
    month: dayjs().month(),
    year: dayjs().year(),
  });
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);

  const orderCategoriesByDebitAmount = (
    categories: BudgetCategory[],
    isOpen: boolean,
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_debit != 0 || cat.planned_amount_debit != 0,
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.planned_amount_debit + '') -
            Number(a.planned_amount_debit + '')
          );
        return (
          Number(b.current_amount_debit + '') -
          Number(a.current_amount_debit + '')
        );
      });
  };

  const orderCategoriesByCreditAmount = (
    categories: BudgetCategory[],
    isOpen: boolean,
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_credit != 0 || cat.planned_amount_credit != 0,
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.planned_amount_credit + '') -
            Number(a.planned_amount_credit + '')
          );
        return (
          Number(b.current_amount_credit + '') -
          Number(a.current_amount_credit + '')
        );
      });
  };

  const debitCategories = useMemo(() => {
    return orderCategoriesByDebitAmount(categories, isOpen);
  }, [categories, isOpen]);

  const creditCategories = useMemo(() => {
    return orderCategoriesByCreditAmount(categories, isOpen);
  }, [categories, isOpen]);

  const handleEmojiAdded = (emojiText: string) => {
    setDescriptionValue((prevValue) => `${prevValue} ${emojiText} `);
    descriptionRef?.current?.focus();
    setEmojiPickerOpen(false);
  };

  // Fetch
  useEffect(() => {
    if (!id) return;
    getBudgetRequest.refetch();
  }, [id]);

  // Loading
  useEffect(() => {
    if (getBudgetRequest.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getBudgetRequest.isLoading]);

  // Error
  useEffect(() => {
    if (getBudgetRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getBudgetRequest.isError]);

  // Data successfully loaded
  useEffect(() => {
    if (!getBudgetRequest.data) return;
    // datepicker
    setMonthYear({
      month: getBudgetRequest.data.month,
      year: getBudgetRequest.data.year,
    });
    // observations
    setDescriptionValue(getBudgetRequest.data.observations);

    // categories
    setCategories(getBudgetRequest.data.categories);

    // open
    setOpen(getBudgetRequest.data.is_open == 1);
  }, [getBudgetRequest.data]);

  if (getBudgetRequest.isLoading || !getBudgetRequest.data) {
    return null;
  }

  const DebitBorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 500],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      background: cssGradients[ColorGradient.Red],
    },
  }));

  const CreditBorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 500],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      background: cssGradients[ColorGradient.Green],
    },
  }));

  function getCurrentCategoryValuePercentage(
    category: BudgetCategory,
    isDebit: boolean,
  ): number {
    if (isDebit)
      return Math.min(
        Math.ceil(
          (category.current_amount_debit * 100) / category.planned_amount_debit,
        ),
        100,
      );
    return Math.min(
      Math.ceil(
        (category.current_amount_credit * 100) / category.planned_amount_credit,
      ),
      100,
    );
  }

  const buildTooltipBottomCard = (
    category: BudgetCategory,
    isDebit: boolean,
  ) => {
    let diff = 0;
    let textKey = '';
    if (isDebit) {
      diff =
        Number(category.current_amount_debit + '') -
        Number(category.planned_amount_debit + '');
      switch (true) {
        case diff > 0:
          textKey = 'budgetDetails.catRemainderDebitOver';
          break;
        case diff < 0:
          textKey = 'budgetDetails.catRemainderDebitUnder';
          break;
        default:
          textKey = t('budgetDetails.catRemainderDebitEqual', {
            amount: formatNumberAsCurrency(diff),
          });
          break;
      }
    } else {
      diff =
        Number(category.current_amount_credit + '') -
        Number(category.planned_amount_credit + '');
      switch (true) {
        case diff > 0:
          textKey = 'budgetDetails.catRemainderCreditOver';
          break;
        case diff < 0:
          textKey = 'budgetDetails.catRemainderCreditUnder';
          break;
        default:
          textKey = 'budgetDetails.catRemainderCreditEqual';
          break;
      }
    }

    let background = '';
    switch (true) {
      case isDebit && diff < 0:
      case !isDebit && diff > 0:
        background = cssGradients[ColorGradient.Green];
        break;
      case isDebit && diff > 0:
      case !isDebit && diff < 0:
        background = cssGradients[ColorGradient.Red];
        break;
      default:
        background = cssGradients[ColorGradient.Orange];
        break;
    }

    return (
      <Container sx={{ p: 2, background: background }}>
        <Typography variant="body2">
          <Trans
            i18nKey={textKey}
            values={{
              amount: formatNumberAsCurrency(Math.abs(diff)),
            }}
          />
        </Typography>
      </Container>
    );
  };

  const renderCategoryTooltip = (
    category: BudgetCategory,
    isDebit: boolean,
  ) => {
    return (
      <React.Fragment>
        <Container>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            <strong>
              <em>{category.description || '-'}</em>
            </strong>
          </Typography>
          {category.exclude_from_budgets == true && (
            <Chip
              label={t('categories.excludedFromBudgets')}
              sx={{ mt: 1, display: 'flex' }}
            />
          )}
        </Container>
        <Divider sx={{ m: 2 }} />
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {getMonthsFullName(monthYear.month)} {monthYear.year - 1}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_same_month_previous_year_debit
                  : category.avg_same_month_previous_year_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {t('budgetDetails.previousMonth')}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_previous_month_debit
                  : category.avg_previous_month_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {t('budgetDetails.12MonthAvg')}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_12_months_debit
                  : category.avg_12_months_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {t('budgetDetails.globalAverage')}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_lifetime_debit
                  : category.avg_lifetime_credit,
              )}
            />
          </Grid>
        </Grid>
        <Card variant="elevation" sx={{ width: '100%', mt: 2 }}>
          <center>{buildTooltipBottomCard(category, isDebit)}</center>
        </Card>
      </React.Fragment>
    );
  };

  function renderCategoryRow(category: BudgetCategory, isDebit: boolean) {
    return (
      <Card variant="elevation" sx={{ width: '100%' }}>
        <Grid container xs={12} spacing={2} p={2}>
          <Grid xs={12} md={4}>
            <Tooltip title={renderCategoryTooltip(category, isDebit)}>
              <ListItemText
                primary={category.name}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              required
              disabled={!isOpen}
              id={`estimated_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              name={`estimated_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Euro />
                  </InputAdornment>
                ),
              }}
              margin="none"
              type="number"
              label={t('budgetDetails.estimated')}
              fullWidth
              variant="outlined"
              inputProps={{
                step: 0.01,
              }}
              value={
                isDebit
                  ? category.planned_amount_debit
                  : category.planned_amount_credit
              }
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              required
              disabled
              id={`current_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              name={`current_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Euro />
                  </InputAdornment>
                ),
              }}
              margin="none"
              type="number"
              label={t('budgetDetails.current')}
              fullWidth
              variant="outlined"
              inputProps={{
                step: 0.01,
              }}
              value={
                isDebit
                  ? category.current_amount_debit
                  : category.current_amount_credit
              }
            />
          </Grid>
        </Grid>
        <CardActions disableSpacing>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            {isDebit ? (
              <DebitBorderLinearProgress
                variant="determinate"
                value={getCurrentCategoryValuePercentage(category, isDebit)}
              />
            ) : (
              <CreditBorderLinearProgress
                variant="determinate"
                value={getCurrentCategoryValuePercentage(category, isDebit)}
              />
            )}
          </Stack>
        </CardActions>
      </Card>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <PageHeader
          title={t('budgetDetails.budget')}
          subtitle={t('budgetDetails.strapLine')}
        />
        <Button
          size="small"
          variant="contained"
          startIcon={<FileCopy />}
          onClick={() => {}}
        >
          {t('budgetDetails.cloneAnotherBudget')}
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid xs={12} md={6} lg={3}>
          <DatePicker
            label={t('stats.month')}
            views={['month', 'year']}
            /*onChange={(newDate) => handleMonthChange(newDate)}*/
            value={dayjs(
              `${monthYear.year}-${addLeadingZero(monthYear.month)}`,
            )}
          />
        </Grid>
        <Grid xs={12} md={6} lgOffset={3}>
          <TextField
            inputRef={descriptionRef}
            required
            fullWidth
            margin="none"
            id="description"
            name="description"
            label={t('common.description')}
            placeholder={t('common.description')}
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={'Emojis'}>
                    <IconButton
                      aria-label={'Emojis'}
                      onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)}
                      edge="end"
                    >
                      {matchesSmScreen ? null : isEmojiPickerOpen ? (
                        <AddReaction color="primary" />
                      ) : (
                        <AddReactionOutlined color="primary" />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          {isEmojiPickerOpen && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                /*position: 'absolute',
                right: 0,
                marginRight: 4,
                marginTop: -1,*/
              }}
            >
              <EmojiPicker
                reactions={['•', '⋆', '-', '1f4bc', '1f9f0', '1f381']}
                reactionsDefaultOpen={true}
                open={!matchesSmScreen && isEmojiPickerOpen}
                theme={theme.palette.mode === 'dark' ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={(emoji) => handleEmojiAdded(emoji.emoji)}
                customEmojis={[
                  {
                    names: ['Dot', 'period'],
                    imgUrl: '/res/emoji_dot.png',
                    id: '•',
                  },
                  {
                    names: ['Dash', 'dash'],
                    imgUrl: '/res/emoji_dash.png',
                    id: '-',
                  },
                  {
                    names: ['Star', 'star'],
                    imgUrl: '/res/emoji_star.png',
                    id: '⋆',
                  },
                ]}
              />
            </Box>
          )}
        </Grid>
        <Grid xs={12} md={6}>
          <Typography variant="h4">{t('common.debit')}</Typography>
          <List>
            {debitCategories.map((category) => (
              <React.Fragment key={category.category_id}>
                <ListItem alignItems="flex-start" sx={{ pl: 0, pr: 0 }}>
                  {renderCategoryRow(category, true)}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>
        <Grid xs={12} md={6}>
          <Typography variant="h4">{t('common.credit')}</Typography>
          <List>
            {creditCategories.map((category) => (
              <React.Fragment key={category.category_id}>
                <ListItem alignItems="flex-start">
                  {renderCategoryRow(category, false)}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BudgetDetails;
