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
import { useForm, Controller } from 'react-hook-form'
import { useWallet } from '@/context/wallet'
import { useEffect } from 'react'
import { NetworkType } from '@airgap/beacon-sdk'

import AuthImage from '../public/auth-bg.png'

type FormValues = {
    email: string,
    address: string,
    organization: string
}

export default function SignUp() {
    const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
        defaultValues: {
            email: '',
            address: '',
            organization: ''
        }
    })
    const router = useRouter()
    const { address } = watch()
    const wallet = useWallet()

    const connectWallet = async () => {
        await wallet.requestPermissions({
            network: {
                type: process.env.NEXT_PUBLIC_TZ_NETWORK as NetworkType
            }
        })
        const userAddress = await wallet.getPKH()
        setValue('address', userAddress)
    }

    const disconnectWallet = async () => {
        await wallet.clearActiveAccount()
        setValue('address', '')
    }

    const onSubmit = (data: FormValues) => {
        const { email, address, organization } = data
        axios.post('/api/auth/signup', {
            address,
            email,
            organization
        }).then(() => {
            router.push('/confirm')
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        (async () => {
            const account = await wallet.client.getActiveAccount()
            setValue('address', account? account.address : '')
        })()
    }, [])

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
                    backgroundColor: 'rgba(255, 255, 255, 0.8)' 
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <Typography component="h2" variant="caption">
                    Connect your wallet and fill the form to sign-up
                </Typography>
                <Box component="form" sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='body1' textAlign='center'>
                                {address ? address : 'No wallet connected'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={address ? disconnectWallet : connectWallet}
                            >
                                {address ? 'Disconnect Wallet' : 'Connect Wallet'}
                            </Button>
                        </Grid>
                        <Controller control={control} name="organization" render={({ field }) => (
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Organization Name"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </Grid>
                        )} />
                        <Controller control={control} name="email" render={({ field }) => (
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Organization Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </Grid>
                        )} />
                    </Grid>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 5, mb: 2 }}
                        onClick={handleSubmit(onSubmit)}
                    >
                        Sign Up
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="/sign-in" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}