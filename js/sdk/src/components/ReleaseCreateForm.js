import React, { useEffect, useState, useRef } from 'react'
import { styled } from '@mui/material/styles'
import { withFormik, Form, Field } from 'formik'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { formatPlaceholder } from '@nina-protocol/nina-internal-sdk/esm/utils'
import dynamic from 'next/dynamic'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import { useWallet } from '@solana/wallet-adapter-react'
const QuillEditor = dynamic(() => import('./QuillEditor'), { ssr: false })

const SOL_DENOMINATED_WALLETS = [
  'HesfTj24Eatwy8vvra5UdhX1xJWLeqRM7QdDwjX1xmmk',
  '3Z8cBM8XT5CBJwVJzpZo6ikkinYma1EEqN2o39ZFYApZ',
  '7g2euzpRxm2A9kgk4UJ9J5ntUYvodTw4s4m7sL1C8JE',
]

const ReleaseCreateForm = ({
  field,
  form,
  values,
  onChange,
  errors,
  setFieldValue,
  touched,
  disabled,
}) => {
  const wallet = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [isUsdc, setIsUsdc] = useState(true)
  const [inputValue, setInputValue] = useState(undefined)
  const editionRef = useRef(isOpen)

  useEffect(() => {
    if (onChange) {
      onChange(values)
    }
  }, [values])

  useEffect(() => {
    if (SOL_DENOMINATED_WALLETS.includes(wallet?.publicKey.toBase58())) {
      setIsUsdc(false)
    }
  }, [wallet])

  useEffect(() => {
    if (isOpen) {
      const infinity = '\u221e'
      setFieldValue('isOpen', true)

      setFieldValue('amount', infinity)
    }
    if (!isOpen) {
      setFieldValue('isOpen', false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isUsdc) {
      setFieldValue('isUsdc', true)
    } else {
      setFieldValue('isUsdc', false)
    }
  }, [isUsdc])

  const valuetext = (value) => {
    return `${value}%`
  }

  const handleEditionChange = (event) => {
    editionRef.current = event.target.value
    if (editionRef.current === 'unlimited') {
      setIsOpen(true)
    }
    if (editionRef.current === 'limited') {
      setIsOpen(false)
      setFieldValue('amount', inputValue)
    }
  }

  return (
    <Root disabled={disabled}>
      <Form>
        <Field name="artist">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.artist ? { shrink: true } : ''}
                placeholder={
                  errors.artist && touched.artist ? errors.artist : null
                }
                disabled={disabled}
                {...props.field}
              />
            </Box>
          )}
        </Field>

        <Field name="title">
          {(props) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={classes.formField}
                variant="standard"
                label={formatPlaceholder(props.field.name)}
                size="small"
                InputLabelProps={touched.title ? { shrink: true } : ''}
                placeholder={
                  errors.title && touched.title ? errors.title : null
                }
                disabled={disabled}
                {...props.field}
              />
            </Box>
          )}
        </Field>

        <Field name="catalogNumber">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={formatPlaceholder(field.name)}
                size="small"
                InputLabelProps={touched.catalogNumber ? { shrink: true } : ''}
                placeholder={
                  errors.catalogNumber && touched.catalogNumber
                    ? errors.catalogNumber
                    : null
                }
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  onChange: (event) => {
                    let sanitized = event.target.value
                      .replace(/\s/g, '')
                      .toUpperCase()
                    setFieldValue('catalogNumber', sanitized)
                  },
                }}
                disabled={disabled}
                {...field}
              />
            </Box>
          )}
        </Field>
        <FormControlBox
          disabled={disabled}
          className={classes.fieldInputWrapper}
        >
          <FormControl
            sx={{
              flexDirection: 'row',
              marginTop: '8px',
            }}
          >
            <StyledFormLabel focused={false}>EDITION TYPE</StyledFormLabel>{' '}
            <RadioGroup
              row
              aria-labelledby="amount"
              defaultValue={editionRef.current}
            >
              <StyledFormControlLabel
                value="limited"
                disableRipple
                control={<FormRadio />}
                label="Limited"
                onClick={(event) => handleEditionChange(event)}
                checked={!isOpen}
                disabled={disabled}
              />
              <StyledFormControlLabel
                value="unlimited"
                disableRipple
                control={<FormRadio />}
                label="Unlimited"
                onClick={(event) => handleEditionChange(event)}
                checked={isOpen}
                disabled={disabled}
              />
            </RadioGroup>
          </FormControl>
        </FormControlBox>
        <Field name="amount">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper} align={'left'}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={formatPlaceholder('Edition Size')}
                size="small"
                type={isOpen ? 'text' : 'number'}
                InputLabelProps={touched.amount ? { shrink: true } : ''}
                placeholder={
                  errors.amount && touched.amount ? errors.amount : null
                }
                InputProps={{
                  onChange: (event) => {
                    setInputValue(event.target.value)
                    if (!isOpen) {
                      let whole = parseInt(event.target.value)
                      setFieldValue('amount', whole)
                      setFieldValue('isOpen', false)
                    }
                    if (isOpen) {
                      setFieldValue('isOpen', true)
                      setFieldValue('amount', 'Open')
                    }
                  },
                }}
                sx={{
                  '.MuiInputBase-input': {
                    fontSize: isOpen ? '19px !important' : '',
                    padding: isOpen ? '0px 0px 0px 0px !important' : '',
                  },
                }}
                disabled={isOpen || disabled}
                {...field}
              />
            </Box>
          )}
        </Field>
        <Field name="retailPrice">
          {({ field }) => (
            <Box className={classes.fieldInputWrapper}>
              <TextField
                className={`${classes.formField}`}
                variant="standard"
                label={`${formatPlaceholder('Price')}${
                  !isUsdc ? ' (SOL)' : ''
                }`}
                size="small"
                InputLabelProps={touched.retailPrice ? { shrink: true } : ''}
                placeholder={
                  errors.retailPrice && touched.retailPrice
                    ? errors.retailPrice
                    : null
                }
                type="number"
                disabled={disabled}
                {...field}
              />
            </Box>
          )}
        </Field>

        <Box className={`${classes.formField}`} width="100%">
          <Typography
            id="discrete-slider-custom"
            align="left"
            style={{
              color: 'rgba(0, 0, 0, 0.54)',
              fontSize: '12px',
              marginTop: '8px',
            }}
          >
            RESALE PERCENTAGE: {values.resalePercentage}%
          </Typography>
          <Box>
            <Slider
              defaultValue={0}
              getAriaValueText={valuetext}
              aria-labelledby="percent"
              className={classes.formField}
              step={1}
              min={0}
              max={100}
              value={values.resalePercentage}
              name="resalePercentage"
              onChange={(event, value) => {
                setFieldValue('resalePercentage', value)
              }}
              disabled={disabled}
              {...field}
              {...form}
            />
            <Fade in={values.resalePercentage > 20}>
              <Warning variant="subtitle1" align="left">
                Are you certain about a {values.resalePercentage}% resale fee?
                High resale may discourage potential collectors.
              </Warning>
            </Fade>

            <Field name="description">
              {(props) => (
                <Box sx={{ borderBottom: '1px solid grey', height: '90px' }}>
                  <QuillEditor
                    formikProps={props}
                    type={'release'}
                    update={false}
                  />
                </Box>
              )}
            </Field>
          </Box>
        </Box>
      </Form>
    </Root>
  )
}

const FormRadio = (props) => {
  return (
    <Radio
      disableRipple
      color="default"
      sx={{
        '&&:hover': {
          backgroundColor: 'transparent',
        },
        padding: '4px 6px',
      }}
      {...props}
    />
  )
}
const PREFIX = 'ReleaseCreateForm'

const classes = {
  fieldInputWrapper: `${PREFIX}-fieldInputWrapper`,
  formField: `${PREFIX}-formField`,
}

const Root = styled('div')(({ theme, disabled }) => ({
  margin: 'auto',
  width: '300px',
  cursor: disabled ? 'not-allowed' : 'auto',
  border: disabled ? '1px solid #red' : '1px solid #red',
  [`& .${classes.fieldInputWrapper}`]: {
    position: 'relative',
  },
  [`& .${classes.formField}`]: {
    ...theme.helpers.baseFont,
    marginBottom: '8px',
    width: '100%',
    position: 'relative',
    '& input': {
      cursor: disabled ? 'not-allowed' : 'auto',

      textAlign: 'left',
      '&::placeholder': {
        color: theme.palette.red,
      },
    },
  },
}))

const Warning = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  textTransform: 'none !important',
  color: theme.palette.red,
  opacity: '85%',
  top: '-5%',
  left: '122%',
  width: '220px',
}))

const FormControlBox = styled(Box)(({ disabled }) => ({
  display: 'flex',
  alignItems: 'left',
  textAlign: 'center',
  marginBottom: '8px',
  borderBottom: `1px solid`,
  cursor: disabled ? 'not-allowed' : 'auto',
}))

const StyledFormLabel = styled(FormLabel)(() => ({
  marginTop: '8px',
  marginRight: '16px',
}))

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginLeft: '0',
  marginRight: '0',
  '& .MuiSvgIcon-root:not(.MuiSvgIcon-root ~ .MuiSvgIcon-root) path': {
    color: theme.palette.black,
  },
  '& .MuiSvgIcon-root + .MuiSvgIcon-root': {
    color: theme.palette.black,
  },
}))

export default withFormik({
  enableReinitialize: true,
  validationSchema: (props) => {
    return props.ReleaseCreateSchema
  },
  mapPropsToValues: () => {
    return {
      artist: '',
      title: '',
      description: '',
      catalogNumber: '',
      amount: '',
      retailPrice: undefined,
      resalePercentage: 10,
      isOpen: false,
      isUsdc: true,
    }
  },
})(ReleaseCreateForm)
