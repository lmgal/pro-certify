import { useState, createContext, useContext } from "react"
import { BeaconWallet } from "@taquito/beacon-wallet"
import { NetworkType } from "@airgap/beacon-sdk"

type WalletProviderProps = {
    children: React.ReactNode
}

const WalletContext = createContext<BeaconWallet | null>(null)

/**
 * @returns wallet - the browser wallet extension instance
 */
export const useWallet = () => useContext(WalletContext) as BeaconWallet

export const WalletProvider = (props: WalletProviderProps) => {
    const [wallet] = useState(new BeaconWallet({
        name: 'ProCertify',
        preferredNetwork: process.env.NEXT_PUBLIC_TZ_NETWORK as NetworkType
    }))

    return (
        <WalletContext.Provider value={wallet}>
            {props.children}
        </WalletContext.Provider>
    )
}