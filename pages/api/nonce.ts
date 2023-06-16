import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

interface NonceNextApiRequest extends NextApiRequest {
    body: {
        address: string
    }
}

export default async function handler(
  req: NonceNextApiRequest,
  res: NextApiResponse
) {
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
    )

    const { address } = req.body
    const nonce = Math.floor(Math.random() * 1000000)

    await supabase.from('users')
        .update({
            auth: {
                genNonce: nonce,
                lastAuth: new Date().toISOString(),
                lastAuthStatus: 'pending'
            }
        })
        .eq('wallet_address', address)

    return res.status(200).json({
        success: true,
        nonce
    })
}