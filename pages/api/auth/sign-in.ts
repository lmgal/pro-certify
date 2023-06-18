import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { TezosToolkit } from '@taquito/taquito'
import { verifySignature, getPkhfromPk } from '@taquito/utils'

interface LoginNextApiRequest extends NextApiRequest {
    body: {
        payload: string,
        publicKey: string,
        signature: string
    }
}

export default async function handler(
    req: LoginNextApiRequest,
    res: NextApiResponse
) {
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
    )
    const Tezos = new TezosToolkit(process.env.NEXT_PUBLIC_TZ_RPC_URL!)

    const { payload, publicKey, signature } = req.body   
    const address = getPkhfromPk(publicKey)
    
    // Get email from address
    const { data: wallet, error: walletError } = await supabase.from('wallets')
        .select('org_email, confirmed')
        .eq('address', address)
        .single()
    
    if (walletError) 
        return res.status(400).json({ success: false, error: walletError.message })

    // If not found, return error
    if (!wallet) 
        return res.status(400).json({ success: false, error: 'Wallet not found' })

    // If not confirmed, return error
    if (!wallet.confirmed) 
        return res.status(400).json({ success: false, error: 'Wallet not confirmed' })
    
    // Verify signature
    const verified = verifySignature(
        payload,
        publicKey,
        signature
    )
    if (!verified)
        return res.status(400).json({ success: false, error: 'Signature not verified' })

    // Generate magic link
    const { data, error } = await supabase.auth.admin.generateLink({
        email: wallet.org_email,
        type: 'magiclink',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/signing-in`
        }
    })

    if (error) 
        return res.status(400).json({ success: false, error: error.message })

    // Return magic link
    return res.status(200).json({ 
        success: true,  
        link: data!.properties.action_link
    })
}