// @ts-nocheck
import { createContext } from "react"
import { MichelsonMap, Contract } from "@taquito/taquito"
import { useTezos } from "./tezos"
import axios from "axios"
import { bytes2Char } from "@taquito/utils"

type ContractProviderProps = {
    children: React.ReactNode
}

type ContractContextType = {
    contract: Contract,
}

type MintAction = {
    to_: string,
    ipfs: string
}

type BurnAction = {
    from_: string,
    token_id: number
}

const ContractContext = createContext()

export const ContractProvider = (props: ContractProviderProps) => {
    const { children } = props
    const tezos = useTezos()

    const mint = async (batch: MintAction[]) => {
        const contract = await tezos.wallet.at(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string)
        
        const op = await contract.methods.mint(batch.map((action) => {
            // Convert ipfs url to bytes
            let bytes = ''
            for (let i = 0; i < action.ipfs.length; i++) {
                bytes += action.ipfs.charCodeAt(i).toString(16).slice(-4)
            }

            return {
                to_: action.to_,
                metadata: new MichelsonMap({
                    ipfs: bytes
                })
            }
        })).send()

        await op.confirmation()
    }    

    const burn = async (batch: BurnAction[]) => {
        const contract = await tezos.wallet.at(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string)

        const op = await contract.methods.burn(batch.map(action => {
            return {
                from_: action.from_,
                token_id: action.token_id,
                amount: 1
            }
        })).send()
        
        await op.confirmation()
    }

    const getActiveTokens = async () => {
        try {
            const tokensReq = await axios.get(
                `https://api.${process.env.NEXT_PUBLIC_TZ_NETWORK}.tzkt.io/v1/contracts/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/big_map/token_metadata/keys`, {
                    params: {
                        active: true
                    }
                }
            )

            const tokens = tokensReq.data as {
                key: string,
                value: {
                    token_id: number,
                    token_info: {
                        ipfs: string
                    }
                }
            }[]
            const completeTokens = await Promise.all(tokens.map(async (token) => {
                const ipfsUrl = bytes2Char(token.value.token_info.ipfs)
                const cid = ipfsUrl.split('/').pop()

                const { data : metadata } = await axios.get(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`)
                return {
                    token_id: token.value.token_id,
                    ...metadata
                } as {
                    token_id: number,
                    [key: string]: any
                }
            }))

            return completeTokens
        } catch (e) {
            console.log(e)
        }
    }

    const getTokenByMinter = async (minter: string) => {
        try {
            const tokensReq = await axios.get(
                `https://api.${process.env.NEXT_PUBLIC_TZ_NETWORK}.tzkt.io/v1/contracts/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/big_map/minter/keys`, {
                    params: {
                        active: true,
                        value: minter
                    }
                }
            )

            const tokens = tokensReq.data as {
                key: string,
                value: {
                    token_id: number,
                    token_info: {
                        ipfs: string
                    }
                }
            }[]
            const completeTokens = await Promise.all(tokens.map(async (token) => {
                const ipfsUrl = bytes2Char(token.value.token_info.ipfs)
                const cid = ipfsUrl.split('/').pop()

                const { data : metadata } = await axios.get(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`)
                return {
                    token_id: token.value.token_id,
                    ...metadata
                } as {
                    token_id: number,
                    [key: string]: any
                }
            }))

            return completeTokens
        } catch (e) {
            console.log(e)
        }
    }

    const getTokensByOwner = async (owner: string) => {
        try {
            const tokensReq = await axios.get(
                `https://api.${process.env.NEXT_PUBLIC_TZ_NETWORK}.tzkt.io/v1/contracts/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/big_map/ledger/keys`, {
                    params: {
                        active: true,
                        value: owner
                    }
                }
            )
            
            const tokens = tokensReq.data as {
                key: string,
                value: {
                    token_id: number,
                    token_info: {
                        ipfs: string
                    }
                }
            }[]
            const completeTokens = await Promise.all(tokens.map(async (token) => {
                const ipfsUrl = bytes2Char(token.value.token_info.ipfs)
                const cid = ipfsUrl.split('/').pop()

                const { data : metadata } = await axios.get(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`)
                return {
                    token_id: token.value.token_id,
                    ...metadata
                } as {
                    token_id: number,
                    [key: string]: any
                }
            }))

            return completeTokens
        } catch (e) {
            console.log(e)
        }
    }

    const getTokenById = async (key: number) => {
        try {
            const tokenReq = await axios.get(
                `https://api.${process.env.NEXT_PUBLIC_TZ_NETWORK}.tzkt.io/v1/contracts/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/big_map/token_metadata/keys/${key}`, {
                    params: {
                        active: true
                    }
                }
            )

            const token = tokenReq.data as {
                key: string,
                value: {
                    token_id: number,
                    token_info: {
                        ipfs: string
                    }
                }
            }

            const ipfsUrl = bytes2Char(token.value.token_info.ipfs)
            const cid = ipfsUrl.split('/').pop()

            const { data : metadata } = await axios.get(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`)

            return {
                token_id: token.value.token_id,
                ...metadata
            }
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <ContractContext.Provider value={{
            contract,
            mint,
            burn,
            getActiveTokens,
            getTokenByMinter,
            getTokensByOwner
        }}>
            {children}
        </ContractContext.Provider>
    )
}