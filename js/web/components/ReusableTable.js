import { useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Box } from '@mui/system'
import { Button, Typography } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import Audio from '@nina-protocol/nina-internal-sdk/esm/Audio'
import { imageManager } from '@nina-protocol/nina-internal-sdk/src/utils'
import { styled } from '@mui/material'
import { useSnackbar } from 'notistack'
// import { release } from 'os'

const { getImageFromCDN, loader } = imageManager

const ReusableTableHead = ({ tableType }) => {
  let headCells = [
    {
      id: 'ctas',
      label: '',
    },
  ]

  if (tableType === 'profilePublishedReleases') {
    headCells.push({ id: '', label: '' })
    headCells.push({ id: 'artist', label: 'Artist' })
    headCells.push({ id: 'title', label: 'Title' })
  }

  //   if (tableType === 'profileCollection') {
  //     headCells.push({ id: '', label: '' })
  //     headCells.push({ id: 'artist', label: 'Artist' })
  //     headCells.push({ id: 'title', label: 'Title' })
  //   }

  //   if (tableType === 'profileHubs') {
  //     headCells.push({ id: 'artist', label: 'Artist' })
  //     headCells.push({ id: 'description', label: 'Description' })
  //   }

  //   if (tableType === 'hubReleases') {
  //     headCells.push({ id: '', label: '' })
  //     headCells.push({ id: 'artist', label: 'Artist' })
  //     headCells.push({ id: 'title', label: 'Title' })
  //   }

  //   if (tableType === 'hubCollaborators') {
  //     headCells.pop()
  //   }

  return (
    <TableHead>
      <TableRow>
        {headCells?.map((headCell, i) => (
          <StyledTableCell
            key={headCell.id}
            sx={{ fontWeight: 'bold', borderBottom: 'none' }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>
              {headCell.label}
            </Typography>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const ReusableTableBody = ({ releases }) => {
  const {
    updateTrack,
    addTrackToQueue,
    isPlaying,
    setIsPlaying,
    track,
    playlist,
  } = useContext(Audio.Context)

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const snackbarHandler = (message) => {
    const snackbarMessage = enqueueSnackbar(message, {
      persistent: 'true',
      variant: 'info',
    })
    setTimeout(() => closeSnackbar(snackbarMessage), 3000)
  }

  const handlePlay = (e, releasePubkey) => {
    e.stopPropagation()
    e.preventDefault()
    if (isPlaying && track.releasePubkey === releasePubkey) {
      setIsPlaying(false)
    } else {
      updateTrack(releasePubkey, true, true)
    }
  }

  const handleQueue = (e, releasePubkey, title) => {
    e.stopPropagation()
    e.preventDefault()
    const isAlreadyQueued = playlist.some((entry) => entry.title === title)
    const filteredTrackName =
      title?.length > 12 ? `${title.substring(0, 12)}...` : title
    if (releasePubkey && !isAlreadyQueued) {
      addTrackToQueue(releasePubkey)
      snackbarHandler(`${filteredTrackName} successfully added to queue`)
    } else {
      snackbarHandler(`${filteredTrackName} already added to queue`)
    }
  }

  let rows = releases?.map((data) => {
    const metadata = data?.metadata
    const properties = data?.metadata?.properties
    const releasePubkey = data?.releasePubkey
    // const hubPubkey = data.handle
    // const hubProperties = data.json
    // const date = data.createdAt
    // const collaboratorPubkey = data.collaborator
    // const collaboratorId = data.id

    console.log('data', data)

    const formattedData = {
      id: releasePubkey,
      artist: properties?.artist,
      title: properties?.title,
    }

    return formattedData
  })

  return ( 
    <TableBody>
      {rows?.map((row, i) => (
        <>
          {console.log('rowxxx', row)}
          <Link key={i} href={'/'} passHref>
            <TableRow key={i} hover>
              {/*  */}

              {Object.keys(row).map((cellName) => {
                console.log('cellNasssssme', cellName)
                const cellData = row[cellName]
                console.log('cellDatsssssa', cellData)

                // if (cellName === 'ctas') {
                //   return (
                //     <StyledTableCellButtonsContainer align="left">
                //       <Button
                //         sx={{ cursor: 'pointer' }}
                //         id={cellData.id}
                //         key={cellData.id}
                //         onClickCapture={(e) => handleQueue()}
                //       >
                //         <ControlPointIcon sx={{ color: 'black' }} key={i} />
                //       </Button>
                //       <Button
                //         sx={{
                //           cursor: 'pointer',
                //         }}
                //         onClickCapture={(e) => handlePlay()}
                //         id={cellData.id}
                //       >
                //         {isPlaying &&
                //         track.releasePubkey === row.releasePubkey ? (
                //           <PauseCircleOutlineOutlinedIcon
                //             sx={{ color: 'black' }}
                //             id={cellData.id}
                //           />
                //         ) : (
                //           <PlayCircleOutlineOutlinedIcon
                //             sx={{ color: 'black' }}
                //           />
                //         )}
                //       </Button>
                //     </StyledTableCellButtonsContainer>
                //   )
                // }
                return (
                  <>
                    <TableCell>{cellData}</TableCell>
                  </>
                )
              })}
            </TableRow>
          </Link>
        </>
      ))}
    </TableBody>
  )
}

const ReusableTable = ({ releases, tableType }) => {
  return (
    <ResponsiveContainer>
      <TableContainer>
        <Table>
          <ReusableTableHead tableType={tableType} />
          <ReusableTableBody releases={releases} tableType={tableType} />
        </Table>
      </TableContainer>
    </ResponsiveContainer>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px 0',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const StyledTableCellButtonsContainer = styled(TableCell)(({ theme }) => ({
  width: '100px',
  textAlign: 'left',
  padding: '5px 0',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const StyledTableCellArtistContainer = styled(TableCell)(({ theme }) => ({
  padding: '5px 0',
  textAlign: 'left',
  maxWidth: '20vw',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const OverflowContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}))

const StyledTableCellTitleContainer = styled(TableCell)(({ theme }) => ({
  textDecoration: 'underline',
  maxWidth: '20vw',
  textAlign: 'left',
  padding: '5px 0',
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    padding: '0 5px',
  },
}))

const StyledTableCellBuffer = styled(TableCell)(({ theme }) => ({
  height: '50px',
  borderBottom: 'none',
}))

const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: theme.maxWidth,
  minHeight: '50vh',
  margin: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '100vw',
  },
}))

export default ReusableTable
