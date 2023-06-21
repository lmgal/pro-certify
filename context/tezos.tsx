// @ts-nocheck

import { useState, createContext, useContext, useEffect } from "react"
import { TezosToolkit } from "@taquito/taquito"

import { useWallet } from "./wallet"

type TezosProviderProps = {
    children: React.ReactNode
}

// 
const TezosContext = createContext<TezosToolkit>()

/**
 * @returns tezos - the Tezos Wallet API instance
 */
export const useTezos = () => useContext<TezosToolkit>(TezosContext)

export const TezosProvider = (props: TezosProviderProps) => {
    const wallet = useWallet()
    const [tezos] = useState(
        new TezosToolkit(process.env.NEXT_PUBLIC_TZ_RPC_URL as string)
    )

    useEffect(() => {
        if (wallet) {
            tezos.setWalletProvider(wallet)
        }
    }, [wallet])

    return (
        <TezosContext.Provider value={tezos}>
            {props.children}
        </TezosContext.Provider>
    )
}