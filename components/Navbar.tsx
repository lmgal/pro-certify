import { useState, useEffect } from 'react'

import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { NetworkType } from '@airgap/beacon-sdk'
import { useWallet } from '@/context/wallet'

export default function Navbar() {
    const [address, setAddress] = useState('')
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const wallet = useWallet()

    const connectWallet = async () => {
        await wallet.requestPermissions({
            network: {
                type: process.env.NEXT_PUBLIC_TZ_NETWORK as NetworkType
            }
        })
        const address = await wallet.getPKH()
        setAddress(address)
    }

    const disconnectWallet = async () => {
        await wallet.clearActiveAccount()
        setAddress('')
        handleClose()
    }

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    useEffect(() => {
        (async () => {
            const account = await wallet.client.getActiveAccount()
            setAddress(account ? account.address : '')
        })()
    }, [])

    return (
        <AppBar position="relative">
            <Toolbar>
                <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
                    ProCertify
                </Typography>
                {address ? <div>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={handleMenu}
                    >
                        {address}
                    </Button>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={disconnectWallet}>Disconnect</MenuItem>
                    </Menu>
                </div> :
                    <Button color="inherit" onClick={connectWallet}>
                        Connect Wallet
                    </Button>
                }
            </Toolbar>
        </AppBar>
    )
}