import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

interface ConfirmNextApiRequest extends NextApiRequest {
    body: {
        address: string,
        email: string,
        confirmation_code: string
    }
}

export default async function handler(
    req: ConfirmNextApiRequest,
    res: NextApiResponse
) { 
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
    )

    const { address, email, confirmation_code } = req.body

    // Validate
    if (!address || !email || !confirmation_code) {
        return res.status(400).json({ success: false, error: 'Missing fields' })
    }

    // Check if confirmation code matches
    const { data: wallet, error } = await supabase.from('wallets')
        .select()
        .eq('address', address)
        .eq('org_email', email)
        .single()
    
    if (error) {
        return res.status(400).json({ success: false, error: error.message })
    }

    if (wallet?.confirmation_code !== confirmation_code) {
        return res.status(400).json({ success: false, error: 'Invalid confirmation code' })
    }

    // Confirm email
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find((user) => user.email === email)
    const { error: confirmError } = await supabase.auth.admin.updateUserById(user?.id!, {
        email_confirm: true
    })
    if (confirmError) {
        return res.status(400).json({ success: false, error: confirmError.message })
    }

    // Update wallet
    const { error: updateError } = await supabase.from('wallets')
        .update({
            confirmed: true
        })
        .eq('address', address)

    if (updateError) {
        return res.status(400).json({ success: false, error: updateError.message })
    }

    return res.status(200).json({ success: true })
}