import React, { useState, useContext, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import nina from '@nina-protocol/nina-sdk'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Dots from './Dots'

import { useWallet } from '@solana/wallet-adapter-react'
const ContentTileView = dynamic(() => import('./ContentTileView'))
const { HubContext, NinaContext, ReleaseContext } = nina.contexts

const Hub = ({ hubPubkey }) => {
  const { hubState, hubContentState, hubCollaboratorsState, initialLoad, getHub } =
    useContext(HubContext)
  const { postState } = useContext(NinaContext)
  const { releaseState } = useContext(ReleaseContext)
  const wallet = useWallet()

  useEffect(() => {
    getHub(hubPubkey)
  }, [hubPubkey])

  const hubData = useMemo(() => hubState[hubPubkey], [hubState, hubPubkey])
  const hubCollaborators = useMemo(
    () => hubCollaboratorsState,
    [hubCollaboratorsState]
  )
  const canAddContent = useMemo(() => {
    if (wallet?.connected) {
      const hubCollaboratorForWallet = Object.values(hubCollaborators)?.filter(
        (hubCollaborator) =>
          hubCollaborator.collaborator === wallet?.publicKey?.toBase58()
      )[0]
      if (hubCollaboratorForWallet && hubCollaboratorForWallet.canAddContent) {
        return true
      }
      if (wallet?.publicKey?.toBase58() === hubData?.authority) {
        return true
      }
    }
    return false
  }, [hubCollaborators, hubData, wallet])

  const content = useMemo(() => {
    const contentArray = []
    Object.keys(hubContentState).forEach((content) => {
      let hubContentData = hubContentState[content]
      if (
        hubContentData.contentType === 'NinaReleaseV1' &&
        releaseState.metadata[hubContentData.release] &&
        hubContentData.visible
      ) {
        const hubReleaseIsReference =
          Object.values(hubContentState).filter(
            (c) => c.referenceContent === hubContentData.release
          ).length > 0
        if (!hubReleaseIsReference) {
          hubContentData = {
            ...hubContentData,
            ...releaseState.metadata[hubContentData.release],
          }
          contentArray.push(hubContentData)
        }
      } else if (
        hubContentData.contentType === 'Post' &&
        postState[hubContentData.post] &&
        hubContentData.visible
      ) {
        hubContentData = {
          ...hubContentData,
          ...postState[hubContentData.post],
        }
        console.log("hubContentData.referenceContent ::> ", hubContentData)
        if (hubContentData.referenceHubContent) {
          hubContentData.releaseMetadata =
            releaseState.metadata[hubContentData.referenceHubContent]
          hubContentData.contentType = 'PostWithRelease'
        }
        contentArray.push(hubContentData)
      }
    })
    return contentArray
      .filter((item) => item)
      .sort((a, b) => b.datetime - a.datetime)
  }, [hubContentState, releaseState, postState])

  console.log("hubData, hubState, hubContentState ::> ", hubData, hubState, hubContentState, hubPubkey)
  console.log("content, initialLoad ::> ", content, initialLoad)

  if (!hubState[hubPubkey]?.json) {
    return null
  }
  if (!hubData) {
    return (
      <Box margin="auto">
        <Dots size="80px" />
      </Box>
    )
  }

  return (
    <>
      <Grid item md={4}>
        <Box padding="100px 15px">
          <Typography align="left" sx={{ color: 'text.primary' }}>
            {hubData?.json.description}
          </Typography>

          {initialLoad && content?.length === 0 && canAddContent && (
            <Box margin="100px auto 0">
              <Typography variant="h2" gutterBottom>
                This hub has no Releases
              </Typography>
              <Typography>
                Visit to your{' '}
                <Link href="/dashboard">
                  <a style={{ textDecoration: 'underline' }}> dashboard </a>
                </Link>{' '}
                to add content to your hub
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>

      <ContentViewWrapper item md={8} height="100%">
        {!initialLoad && (
          <Box mt="29%">
            <Dots size="80px" />
          </Box>
        )}
        {content?.length > 0 && <ContentTileView content={content} />}
      </ContentViewWrapper>
    </>
  )
}

const ContentViewWrapper = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: '15px',
  },
}))

export default Hub
