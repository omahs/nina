import React, { useContext, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Image from 'next/image'
import DownloadIcon from '@mui/icons-material/Download'
import {logEvent} from '@nina-protocol/nina-internal-sdk/src/utils/event'
import axios from 'axios'
import AddToHubModal from './AddToHubModal.js'
import Link from 'next/link'
import {useSnackbar} from 'notistack'


const { getImageFromCDN, loader } = imageManager

const ReleaseCard = (props) => {
  const {
    artwork,
    metadata,
    preview,
    publicKey,
    releasePubkey,
    userHubs,
    release,
    amountHeld
  } = props
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    setInitialized,
  } = useContext(Audio.Context)
  const {enqueueSnackbar} = useSnackbar()

  const image = useMemo(() => metadata?.image)
  const title = useMemo(() => {
    if (
      metadata.properties.title.length > 20 &&
      metadata.properties.title.indexOf(' ') === -1
    ) {
      return metadata.properties.title.substring(0, 20) + '...'
    }
    return metadata.properties.title
  }, [metadata.properties.title])

  const downloadAs = async (url, name) => {
    logEvent('track_download', 'engagement', {
      publicKey: releasePubkey,
    })

    try {
      const response = await axios.get(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        responseType: 'blob',
      })
      if (response?.data) {
        const a = document.createElement('a')
        const url = window.URL.createObjectURL(response.data)
        a.href = url
        a.download = name
        a.click()
      }
      enqueueSnackbar('Release Downloaded', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar('Release Downloaded', {variant: 'error'})
    } 
  }

  return (
    <StyledReleaseCard>
      <StyledReleaseInfo>
        {metadata && (
          <CtaWrapper>
            <Box display="flex">
              <Button
                onClickCapture={() => {
                  setInitialized(true)
                  if (isPlaying && track.releasePubkey === releasePubkey) {
                    setIsPlaying(false)
                  } else {
                    updateTrack(releasePubkey, true, true)
                  }
                }}
                sx={{ height: '22px', width: '28px' }}
              >
                {isPlaying && track.releasePubkey === releasePubkey ? (
                  <PauseCircleOutlineOutlinedIcon sx={{ color: 'white' }} />
                ) : (
                  <PlayCircleOutlineOutlinedIcon sx={{ color: 'white' }} />
                )}
              </Button>
              <Button
                onClick={() => {
                  addTrackToQueue(releasePubkey)
                }}
                sx={{ height: '22px', width: '28px' }}
              >
                <ControlPointIcon sx={{ color: 'white' }} />
              </Button>

              <AddToHubModal
                userHubs={userHubs}
                releasePubkey={releasePubkey}
                metadata={metadata}
              />
            </Box>

            {amountHeld > 0 && (
              <Box>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadAs(
                      metadata.properties.files[0].uri,
                      `${metadata.name
                        .replace(/[^a-z0-9]/gi, '_')
                        .toLowerCase()}___nina.mp3`
                    )
                  }}
                  sx={{height: '20px', width: '28px', marginRight: '0px'}}
                >
                  <DownloadIcon sx={{color: 'white'}}
                  />
                </Button>
              </Box>
            )}
          </CtaWrapper>
        )}

        {metadata && (
          <Fade in={true}>
            <Typography variant="h4" color="white" align="left">
              <Link href={`/profiles/${release?.authority}`}>
                <a style={{ color: 'white' }}>
                  {metadata?.properties?.artist.substring(0, 100) ||
                    metadata?.artist.substring(0, 100)}
                </a>
              </Link>
              , <i>{title}</i>
            </Typography>
          </Fade>
        )}
      </StyledReleaseInfo>

      <Box>
        {preview && (
          <Image
            src={
              artwork?.meta.status === undefined ? '' : artwork.meta.previewUrl
            }
            alt={metadata.artist}
            layout="responsive"
            height={350}
            width={350}
            priority={true}
          />
        )}
        {!preview && metadata && release && (
          <Image
            height={350}
            width={350}
            layout="responsive"
            src={getImageFromCDN(
              image,
              1200,
              new Date(release.releaseDatetime)
            )}
            alt={metadata?.name}
            priority={true}
            loader={loader}
          />
        )}
      </Box>
    </StyledReleaseCard>
  )
}

const StyledReleaseCard = styled(Box)(() => ({
  width: '100%',
  minHeight: '100%',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}))

const CtaWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  '& .MuiButton-root:not(:last-child)': {
    width: '21px',
    marginRight: '10px',
  },
}))

const StyledReleaseInfo = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.blue,
  color: theme.palette.white,
  minHeight: '52px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    minHeight: '52px',
    height: 'unset',
    paddingBottom: '15px',
  },
}))

export default ReleaseCard
