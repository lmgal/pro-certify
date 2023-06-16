// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

interface SignUpNextApiRequest extends NextApiRequest {
  body: {
    address: string,
    email: string,
    organization: string,
  }
}


export default async function handler(
  req: SignUpNextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { address, email, organization } = req.body
  // Validate
  if (!address || !email || !organization) {
    return res.status(400).json({ success: false, error: 'Missing fields' })
  } 
  // Check if valid email via regex
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ success: false, error: 'Invalid email' })
  }

  // Create user
  const { data , error: inviteError } = await supabase.auth
    .admin.inviteUserByEmail(email)

  if (inviteError) {
    return res.status(400).json({ success: false, error: inviteError.message })
  }

  // Create associated public user
  const { error: publicError } = await supabase
    .from('users')
    .insert([{
      wallet_address: address,
      org_email: email,
      org_name: organization,
      user_id: data.user.id
    }])

  if (publicError) {
    return res.status(400).json({ success: false, error: publicError.message })
  }

  res.status(200).json({ success: true })
}
