import React, { useState, useContext, useEffect, useMemo } from 'react'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import Hub from '@nina-protocol/nina-internal-sdk/esm/Hub'
import Nina from '@nina-protocol/nina-internal-sdk/esm/Nina'
import Release from '@nina-protocol/nina-internal-sdk/esm/Release'
import { useWallet } from '@solana/wallet-adapter-react'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import Dots from './Dots'
import { logEvent } from '@nina-protocol/nina-internal-sdk/src/utils/event'
import Gates from '@nina-protocol/nina-internal-sdk/esm/Gates'

const HubsModal = dynamic(() => import('./HubsModal'))

import dynamic from 'next/dynamic'

const BUTTON_WIDTH = '155px'

const ReleasePurchase = (props) => {
  const {
    releasePubkey,
    metadata,
    inPost,
    hubPubkey,
    setAmountHeld,
    amountHeld,
  } = props
  const { enqueueSnackbar } = useSnackbar()
  const wallet = useWallet()
  const {
    releasePurchaseViaHub,
    releasePurchasePending,
    releasePurchaseTransactionPending,
    releaseState,
  } = useContext(Release.Context)
  const { hubState } = useContext(Hub.Context)
  const {
    collection,
    usdcBalance,
    ninaClient,
    checkIfHasBalanceToCompleteAction,
    NinaProgramAction,
  } = useContext(Nina.Context)
  const [release, setRelease] = useState(undefined)
  const [userIsRecipient, setUserIsRecipient] = useState(false)
  const [publishedHub, setPublishedHub] = useState()

  const txPending = useMemo(
    () => releasePurchaseTransactionPending[releasePubkey],
    [releasePubkey, releasePurchaseTransactionPending]
  )
  const pending = useMemo(
    () => releasePurchasePending[releasePubkey],
    [releasePubkey, releasePurchasePending]
  )

  const isAuthority = useMemo(() => {
    if (wallet.connected) {
      return release?.authority === wallet?.publicKey.toBase58()
    }
  }, [release, wallet.connected])

  useEffect(() => {
    if (releaseState.tokenData[releasePubkey]) {
      setRelease(releaseState.tokenData[releasePubkey])
    }
  }, [releaseState])

  useEffect(() => {
    setAmountHeld(collection[releasePubkey] || 0)
  }, [collection[releasePubkey]])

  useEffect(() => {
    if (release?.royaltyRecipients) {
      release.royaltyRecipients.forEach((recipient) => {
        if (
          wallet?.connected &&
          recipient.recipientAuthority === wallet?.publicKey.toBase58() &&
          recipient.percentShare / 10000 > 0
        ) {
          setUserIsRecipient(true)
        }
      })
    }
  }, [release?.royaltyRecipients, wallet?.connected, wallet?.publicKey])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!wallet?.connected) {
      enqueueSnackbar('Please connect your wallet to purchase', {
        variant: 'error',
      })
      logEvent('release_purchase_failure_not_connected', 'engagement', {
        publicKey: releasePubkey,
        hub: hubPubkey,
      })
      return
    }

    let result
    const error = await checkIfHasBalanceToCompleteAction(
      NinaProgramAction.RELEASE_PURCHASE_VIA_HUB
    )
    if (error) {
      enqueueSnackbar(error.msg, { variant: 'failure' })
      return
    }
    if (!release.pending) {
      let releasePriceUi = ninaClient.nativeToUi(
        release.price,
        ninaClient.ids.mints.usdc
      )
      let convertAmount =
        releasePriceUi +
        (releasePriceUi * hubState[hubPubkey].referralFee) / 100
      if (
        !ninaClient.isSol(release.releaseMint) &&
        usdcBalance < convertAmount
      ) {
        enqueueSnackbar('Calculating SOL - USDC Swap...', {
          variant: 'info',
        })
      } else {
        enqueueSnackbar('Preparing transaction...', {
          variant: 'info',
        })
      }
      result = await releasePurchaseViaHub(releasePubkey, hubPubkey)
      if (result) {
        showCompletedTransaction(result)
      }
    }
  }

  const showCompletedTransaction = (result) => {
    enqueueSnackbar(result.msg, {
      variant: result.success ? 'success' : 'warn',
    })
  }

  if (!release) {
    return (
      <>
        <Dots color="inherit" />
      </>
    )
  }

  const buttonText =
    release.remainingSupply > 0 || release.remainingSupply === -1
      ? `${
          release.price > 0
            ? `Buy $${ninaClient.nativeToUiString(
                release.price,
                release.paymentMint
              )}`
            : 'Collect For Free'
        }`
      : `Sold Out ($${ninaClient
          .nativeToUi(release.price, release.paymentMint)
          .toFixed(2)})`

  return (
    <ReleasePurchaseWrapper mt={1}>
      <AmountRemaining variant="body2" align="left">
        {release.editionType === 'open' ? (
          <Typography variant="body2" align="left">
            Open Edition:{' '}
            {`${release?.saleCounter > 0 ? release?.saleCounter : 0} Sold`}
          </Typography>
        ) : (
          <>
            Remaining: <span>{release.remainingSupply} </span> /{' '}
            {release.totalSupply}
          </>
        )}
      </AmountRemaining>

      <Typography variant="body2" align="left" paddingBottom="10px">
        Artist Resale: {release.resalePercentage / 10000}%
      </Typography>
      {wallet?.connected && amountHeld > 0 && (
        <StyledUserAmount>
          {metadata && (
            <Typography variant="body2" align="left">
              You have: {amountHeld || 0} {metadata.symbol}
            </Typography>
          )}
        </StyledUserAmount>
      )}
      {publishedHub && publishedHub.id !== hubPubkey && (
        <Typography variant="body2" align="left" paddingBottom="10px">
          <StyledLink href={`/${publishedHub.handle}`}>
            {`Published via ${publishedHub.json.displayName}`}
          </StyledLink>
        </Typography>
      )}
      <HubsModal releasePubkey={releasePubkey} metadata={metadata} />
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box
          sx={{
            width: '50%',
            paddingRight: '4px',
          }}
        >
          <BuyButton
            fullWidth
            variant="outlined"
            soldOut={release.remainingSupply === 0}
            disabled={release.remainingSupply === 0}
            onClick={(e) => handleSubmit(e)}
          >
            <BuyButtonTypography
              soldOut={release.remainingSupply === 0}
              variant="body2"
              align="left"
            >
              {txPending && <Dots msg="Preparing transaction" />}
              {!txPending && pending && <Dots msg="Awaiting wallet approval" />}
              {!txPending && !pending && buttonText}
            </BuyButtonTypography>
          </BuyButton>
        </Box>
        <Box
          sx={{
            width: '50%',
            paddingLeft: '4px',
          }}
        >
          <Gates
            release={release}
            metadata={metadata}
            releasePubkey={releasePubkey}
            isAuthority={isAuthority}
            amountHeld={amountHeld}
            inSettings={false}
          />
        </Box>
      </Box>
    </ReleasePurchaseWrapper>
  )
}

const BuyButton = styled(Button)(({ theme, soldOut }) => ({
  border: soldOut
    ? `1px solid ${theme.palette.grey.primary}`
    : `1px solid ${theme.palette.text.primary}`,
  height: '55px',
  width: '100%',
  '& p': {
    padding: '10px',
    '&:hover': {
      opacity: '50%',
    },
  },
}))

const BuyButtonTypography = styled(Typography)(({ theme, soldOut }) => ({
  color: soldOut ? theme.palette.grey.primary : '',
}))
const ReleasePurchaseWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {},
}))
const AmountRemaining = styled(Typography)(({ theme }) => ({
  paddingBottom: '10px',
  '& span': {
    color: theme.palette.text.primary,
  },
}))

const StyledUserAmount = styled(Box)(({ theme }) => ({
  color: theme.palette.black,
  ...theme.helpers.baseFont,
  paddingBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
}))
const StyledLink = styled(Link)(() => ({
  '&:hover': {
    cursor: 'pointer',
    opacity: '0.5 !import',
  },
  textDecoration: 'none',
}))

export default ReleasePurchase
