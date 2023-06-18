import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import GlobalStyles from '@mui/material/GlobalStyles'

import { useRouter } from 'next/router'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next'
import { useState } from 'react'

import AuthImage from '../public/auth-bg.png'

type GetQuery = {
    address?: string,
    email?: string
}

export default function Confirm() {
    const router = useRouter()
    const getQuery = router.query as GetQuery

    const [confirmationCode, setConfirmationCode] = useState('')

    const handleSubmit = (confirmationCode: string) => {
        axios.post('/api/auth/confirm', {
            address: getQuery.address,
            email: getQuery.email,
            confirmation_code: confirmationCode
        })
            .then((response) => {
                router.push('/login')
            })
            .catch((error) => {
                console.log(error)
            })
    }

    return (
        <Container component="main" maxWidth="xs">
            <GlobalStyles styles={{
                body: {
                    backgroundImage: `url(${AuthImage.src})`,
                    backgroundSize: 'cover',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.8)' 
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Confirm your email
                </Typography>
                <Typography component="h2" variant="caption">
                    Enter the confirmation code below
                </Typography>
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Confirmation code"
                        id="confirmation_code"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                    />
                    <Button
                        onClick={() => handleSubmit(confirmationCode)}
                        type='submit'
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Confirm
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link href="/signup" variant="body2">
                                {"Not registered? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}

export const getServerSideProps = async (context : GetServerSidePropsContext) => {
    // Check if get query has address and email
    const getQuery = context.query as GetQuery
    if (!getQuery.address || !getQuery.email) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}