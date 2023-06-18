import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import GlobalStyles from '@mui/material/GlobalStyles'

import { useRouter } from 'next/router'
import { useUser } from '@supabase/auth-helpers-react'
import { useEffect} from 'react'

import AuthImage from '../public/auth-bg.png'

export default function SigningIn() {
    const router = useRouter()
    const user = useUser()

    useEffect(() => {
        // Wait for user to be signed in
        if (user)
            router.push('/dashboard')
    }, [user])

    return (
        <Container component="main" maxWidth="xs">
            <GlobalStyles styles={{
                body: {
                    backgroundImage: `url(${AuthImage.src})`,
                    backgroundSize: 'full',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }
            }} />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '30px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    minHeight: '300px'
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Signing in
                </Typography>
                <Typography component="h2" variant="caption">
                    Please wait as we sign you in
                </Typography>
            </Box>
        </Container>
    )
}