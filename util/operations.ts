import { TezosToolkit, MichelsonMap } from "@taquito/taquito"

type MintAction = {
    to_: string,
    ipfs: string
}

type BurnAction = {
    from_: string,
    token_id: number
}

export const mint = async (tezos: TezosToolkit, batch: MintAction[]) => {
    const contract = await tezos.wallet.at(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string)
    
    const op = await contract.methods.mint(batch.map((action) => {
        // Convert ipfs url to bytes
        let bytes = ''
        for (let i = 0; i < action.ipfs.length; i++) {
            bytes += action.ipfs.charCodeAt(i).toString(16).slice(-4)
        }

        return {
            to_: action.to_,
            metadata: MichelsonMap.fromLiteral({
                ipfs: bytes
            })
        }
    })).send()

    await op.confirmation()
}    

export const burn = async (tezos: TezosToolkit, batch: BurnAction[]) => {
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