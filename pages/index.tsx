import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import { useRouter } from 'next/router'

import Navbar from '@/components/Navbar'

import LandingImage from '../public/landing-bg.png'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <Navbar />
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            pt: 8,
            pb: 6,
            backgroundImage: `url(${LandingImage.src})`,
            backgroundSize: 'cover',
            height: '100vh',
            width: '100vw'
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              ProCertify
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              ProCertify is a platform that allows organizations to issue licenses and certifications on the blockchain.
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained" onClick={() => router.push('/')}>Mint</Button>
              <Button variant="outlined">Verify</Button>
            </Stack>
          </Container>
        </Box>
      </main>
    </>
  )
}
