import axios from "axios"
import { bytes2Char } from "@taquito/utils"

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