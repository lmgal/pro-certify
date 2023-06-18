import { useState, createContext, useContext } from "react"
// @ts-expect-error
import { BeaconWallet } from "@taquito/beacon-wallet"

type WalletProviderProps = {
    children: React.ReactNode
}

const WalletContext = createContext<BeaconWallet | null>(null)

export const useWallet = () => useContext<BeaconWallet>(WalletContext)

export const WalletProvider = (props: WalletProviderProps) => {
    const [wallet] = useState(new BeaconWallet({
        name: 'ProCertify',
        preferredNetwork: 'ghostnet'
    }))

    return (
        <WalletContext.Provider value={wallet}>
            {props.children}
        </WalletContext.Provider>
    )
}