import React, {useState, useEffect, useContext, useMemo} from 'react'
import {styled} from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import {encodeBase64} from 'tweetnacl-util'
import axios from 'axios'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockIcon from '@mui/icons-material/Lock'
import CloseIcon from '@mui/icons-material/Close'

import {useWallet} from '@solana/wallet-adapter-react'
import {useSnackbar} from 'notistack'
import Dots from './Dots'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';


const GateUnlockModal = ({gates, releasePubkey, amountHeld, unlockGate}) => {
  const [open, setOpen] = useState(false)
  const {enqueueSnackbar} = useSnackbar()
  const wallet = useWallet()

  const [inProgress, setInProgress] = useState(false)
  const [activeIndex, setActiveIndex] = useState()
  const [file, setFile] = useState(undefined)

  const handleClose = () => {
    setOpen(false)
  }

  const handleUnlockGate = async (gate, index) => {
    setInProgress(true)
    setActiveIndex(index)
    try {
      await unlockGate(gate)
      setOpen(false)
    } catch (error) {
      console.warn(error)
    }
    setInProgress(false)
    setActiveIndex()
  }

  return (
    <Root>
      <Button
        variant="outlined"
        color="primary"
        type="submit"
        onClick={() => setOpen(true)}
        sx={{height: '55px', width: '100%', mt: 1}}
      >
        {' '}
        {amountHeld > 0 ? <LockOpenIcon /> : <LockIcon />}
      </Button>

      <StyledModal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={() => handleClose()}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <StyledPaper>
            <StyledCloseIcon onClick={() => handleClose()} />

            <Typography variant="h5" sx={{mb: 1}}>
              Here are the files that owning this release will gives you access to:
            </Typography>

            {amountHeld > 0 && (
              <>
                <List>
                  {gates.map((gate, index) => {
                    const fileSize = (gate.fileSize / (1024 * 1024)).toFixed(2)
                    return (
                      <ListItem
                        disableGutters
                        secondaryAction={
                          <Box>
                            <IconButton aria-label="delete"
                              disabled={inProgress && activeIndex === index}
                              onClick={() => {
                                handleUnlockGate(gate, index)
                              }}
                            >
                              {inProgress && activeIndex === index ? <Dots /> : <DownloadIcon />}
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemButton>
                          <ListItemText primary={`${gate.fileName} (${fileSize} mb)`} />
                        </ListItemButton>
                      </ListItem>
                    )
                  }

                  )}
                </List>
              </>
            )}

            {amountHeld === 0 && (
              <>
                <Typography variant="h5" sx={{mb: 2}}>
                  There is additional content associated with this release that
                  is only available to owners.
                </Typography>
                <Typography variant="h5" sx={{mb: 2}}>
                  Purchase this release to unlock the additional content.
                </Typography>
              </>
            )}
          </StyledPaper>
        </Fade>
      </StyledModal>
    </Root>
  )
}

const Root = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}))

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledPaper = styled(Paper)(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  width: '40vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  zIndex: '10',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: 'unset',
    margin: '15px',
    padding: theme.spacing(2),
  },
}))

const StyledCloseIcon = styled(CloseIcon)(({theme}) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
}))

export default GateUnlockModal