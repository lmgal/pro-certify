import { NFTStorage, File } from 'nft.storage'
import { useState, useContext, createContext } from 'react'

const NFTStorageContext = createContext<NFTStorage | null>(null)

export const useNFTStorage = () => useContext(NFTStorageContext) as NFTStorage

export function NFTStorageProvider(props: { children: React.ReactNode }) {
    const { children } = props
    const [client] = useState(new NFTStorage({ token: process.env.NEXT_PUBLIC_IPFS_API_KEY as string }))

    return (
        <NFTStorageContext.Provider value={client}>
            {children}
        </NFTStorageContext.Provider>
    )
}