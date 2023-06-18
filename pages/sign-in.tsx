import { useState, useEffect } from "react"
import { char2Bytes } from "@taquito/utils"
import { RequestSignPayloadInput, SigningType } from "@airgap/beacon-sdk"

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import GlobalStyles from '@mui/material/GlobalStyles'

import { useRouter } from 'next/router'
import axios from 'axios'

import { useWallet } from "@/context/wallet"

import AuthImage from '../public/auth-bg.png'

export default function Login() {
    const [address, setAddress] = useState('')
    const router = useRouter()
    const wallet = useWallet()

    const signIn = async () => {
        // Check if wallet is connected
        try {
            const account = await wallet.client.getActiveAccount()
            if (!account)
                return

            // Generate sign-in payload
            const formattedInput = [
                'Tezos Signed Message:',
                process.env.NEXT_PUBLIC_BASE_URL,
                (new Date().toISOString()),
                'sign-in'
            ].join(' ')

            // The bytes to sign
            const bytes = char2Bytes(formattedInput);
            const bytesLength = (bytes.length / 2).toString(16)
            const addPadding = `00000000${bytesLength}`
            const paddedBytesLength = addPadding.slice(addPadding.length - 8)
            const payloadBytes = '05' + '01' + paddedBytesLength + bytes

            const payload: RequestSignPayloadInput = {
                signingType: SigningType.MICHELINE,
                payload: payloadBytes,
                sourceAddress: account.address,
            }

            // Sign payload
            const { signature } = await wallet.client.requestSignPayload(
                payload
            )

            // Get sign-in link
            const { data } = await axios.post('/api/auth/sign-in', {
                payload: payloadBytes,
                publicKey: account.publicKey,
                signature: signature
            })

            const link : string = data.link

            // Redirect to sign-in link
            router.push(link)
        } catch (e) {
            console.log(e)
        }
    }

    const connectWallet = async () => {
        await wallet.requestPermissions({
            network: {
                // @ts-expect-error
                type: 'ghostnet'
            }
        })
        const userAddress = await wallet.getPKH()
        setAddress(userAddress)
    }

    const disconnectWallet = async () => {
        await wallet.clearActiveAccount()
        setAddress('')
    }

    useEffect(() => {
        (async () => {
            const account = await wallet.client.getActiveAccount()
            setAddress(account? account.address : '')
        })()
    }, [])

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
                    Sign in
                </Typography>
                <Typography component="h2" variant="caption">
                    Connect your wallet and sign the payload to sign-in
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
                    </Grid>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 5, mb: 2 }}
                        onClick={signIn}
                    >
                        Sign In
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="/signup" variant="body2">
                                Don't have an account? Sign up
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}