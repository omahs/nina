import { Box } from '@mui/system'
import dynamic from 'next/dynamic'
import Link from 'next/link'
const ProfileReleases = ({ profileReleases, onPlay, onQueue }) => {
if(!profileReleases) return <Box>No releases belong to this address</Box>
  return ( profileReleases ? (profileReleases.map((release) => (
    <Box key={release.metadata.name}>
      <ProfileRelease
        artist={release.metadata.properties.artist}
        title={release.metadata.properties.title}
        releaseUrl={release.metadata.external_url}
        onPlay={onPlay}
        onQueue={onQueue}
        trackId={release.releasePubkey}
        trackName={release.metadata.properties.name}
      />
    </Box>
  ))) : 'No releases belong to this address'
  )
}
const ProfileRelease = ({ releaseUrl, artist, title, onPlay, onQueue, trackId , trackName}) => {
  console.log('releaseUrl', releaseUrl)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', m: 1, p: 1 }}>
      <Box
        sx={{
          mr: 1,
          pr: 1,
          cursor: 'pointer',
          '&:hover': {
            fontStyle: 'italic',
          },
        }}
        onClick={onPlay}
        id={trackId}
      >
        play
      </Box>
      <Box
        sx={{
          mr: 3,
          pr: 3,
          cursor: 'pointer',
          '&:hover': {
            fontStyle: 'italic',
          },
        }}
        id={trackId}
        key={trackName}
        onClick={onQueue}
      >
        queue
      </Box>
      <Link href={`${releaseUrl}`} passHref>
        <a target="_blank" rel="noopener noreferrer">{`${artist} - ${title}`}</a>
      </Link>
    </Box>
  )
}
export default ProfileReleases
