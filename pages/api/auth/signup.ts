// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { createTransport } from 'nodemailer'

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

  // Check if email already signed
  const { data: { users } } = await supabase.auth.admin.listUsers()
  let user = users.find((user) => user.email === email)

  // Create user if not exists
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email
    })

    if (error) {
      return res.status(400).json({ success: false, error: error.message })
    }

    user = data.user!    
  }

  // Create wallet
  // Generate confirmation code
  const confirmation_code = Math.floor(10000 + Math.random() * 90000).toString()

  const { error } = await supabase.from('wallets')
    .insert({
      address: address,
      user_id: user.id,
      org_email: email,
      org_name: organization,
      confirmation_code: confirmation_code
    })

  if (error) {
    return res.status(400).json({ success: false, error: error.message })
  }

  // Send confirmation email
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  })

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'ProCertify: Confirm your wallet',
    html: renderHtmlStringEmail(email, address, confirmation_code)
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(400).json({ success: false, error: error.message })
    }
  })

  res.status(200).json({ success: true })
}

const renderHtmlStringEmail = (
  email: string,
  address: string,
  confirmationCode: string
) => `
<!DOCTYPE html>
<html>
<head>

  <meta charset=&quot;utf-8&quot;>
  <meta http-equiv=&quot;x-ua-compatible&quot; content=&quot;ie=edge&quot;>
  <title>Email Confirmation</title>
  <meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1&quot;>
  <style type=&quot;text/css&quot;>
  /**
   * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
   */
  @media screen {
    @font-face {
      font-family: &#39;Source Sans Pro&#39;;
      font-style: normal;
      font-weight: 400;
      src: local(&#39;Source Sans Pro Regular&#39;), local(&#39;SourceSansPro-Regular&#39;), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format(&#39;woff&#39;);
    }

    @font-face {
      font-family: &#39;Source Sans Pro&#39;;
      font-style: normal;
      font-weight: 700;
      src: local(&#39;Source Sans Pro Bold&#39;), local(&#39;SourceSansPro-Bold&#39;), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format(&#39;woff&#39;);
    }
  }

  /**
   * Avoid browser level font resizing.
   * 1. Windows Mobile
   * 2. iOS / OSX
   */
  body,
  table,
  td,
  a {
    -ms-text-size-adjust: 100%; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
  }

  /**
   * Remove extra space added to tables and cells in Outlook.
   */
  table,
  td {
    mso-table-rspace: 0pt;
    mso-table-lspace: 0pt;
  }

  /**
   * Better fluid images in Internet Explorer.
   */
  img {
    -ms-interpolation-mode: bicubic;
  }

  /**
   * Remove blue links for iOS devices.
   */
  a[x-apple-data-detectors] {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    color: inherit !important;
    text-decoration: none !important;
  }

  /**
   * Fix centering issues in Android 4.4.
   */
  div[style*=&quot;margin: 16px 0;&quot;] {
    margin: 0 !important;
  }

  body {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /**
   * Collapse table borders to avoid space between cells.
   */
  table {
    border-collapse: collapse !important;
  }

  a {
    color: #1a82e2;
  }

  img {
    height: auto;
    line-height: 100%;
    text-decoration: none;
    border: 0;
    outline: none;
  }
  </style>

</head>
<body style=&quot;background-color: #e9ecef;&quot;>

  <!-- start preheader -->
  <div class=&quot;preheader&quot; style=&quot;display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;&quot;>
    Confirm your wallet for ProCertify
  </div>
  <!-- end preheader -->

  <!-- start body -->
  <table border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;100%&quot;>

    <!-- start logo -->
    <tr>
      <td align=&quot;center&quot; bgcolor=&quot;#e9ecef&quot;>
        <!--[if (gte mso 9)|(IE)]>
        <table align=&quot;center&quot; border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;600&quot;>
        <tr>
        <td align=&quot;center&quot; valign=&quot;top&quot; width=&quot;600&quot;>
        <![endif]-->
        <table border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;100%&quot; style=&quot;max-width: 600px;&quot;>
          <tr>
            <td align=&quot;center&quot; valign=&quot;top&quot; style=&quot;padding: 36px 24px;&quot;>
              <h1 style=&quot;margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;&quot;>ProCertify</h1>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end logo -->

    <!-- start hero -->
    <tr>
      <td align=&quot;center&quot; bgcolor=&quot;#e9ecef&quot;>
        <!--[if (gte mso 9)|(IE)]>
        <table align=&quot;center&quot; border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;600&quot;>
        <tr>
        <td align=&quot;center&quot; valign=&quot;top&quot; width=&quot;600&quot;>
        <![endif]-->
        <table border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;100%&quot; style=&quot;max-width: 600px;&quot;>
          <tr>
            <td align=&quot;left&quot; bgcolor=&quot;#ffffff&quot; style=&quot;padding: 36px 24px 0; font-family: &#39;Source Sans Pro&#39;, Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;&quot;>
              <h1 style=&quot;margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;&quot;>Confirm Your Email Address</h1>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end hero -->

    <!-- start copy block -->
    <tr>
      <td align=&quot;center&quot; bgcolor=&quot;#e9ecef&quot;>
        <!--[if (gte mso 9)|(IE)]>
        <table align=&quot;center&quot; border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;600&quot;>
        <tr>
        <td align=&quot;center&quot; valign=&quot;top&quot; width=&quot;600&quot;>
        <![endif]-->
        <table border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;100%&quot; style=&quot;max-width: 600px;&quot;>

          <!-- start copy -->
          <tr>
            <td align=&quot;left&quot; bgcolor=&quot;#ffffff&quot; style=&quot;padding: 24px; font-family: &#39;Source Sans Pro&#39;, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;&quot;>
              <p style=&quot;margin: 0;&quot;>Tap the button below to go to the confirmation page and enter the code to link the wallet address ${address} to your email address.</p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start button -->
          <tr>
            <td align=&quot;left&quot; bgcolor=&quot;#ffffff&quot;>
              <table border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;100%&quot;>
                <tr>
                  <td align=&quot;center&quot; bgcolor=&quot;#ffffff&quot; style=&quot;padding: 12px;&quot;>
                    <table border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot;>
                      <tr>
                        <td align=&quot;center&quot; bgcolor=&quot;#1a82e2&quot; style=&quot;border-radius: 6px;&quot;>
                          <a href=&quot;https://procertify.netlify.app/confirm?email=${email}&address=${address}&quot; target=&quot;_blank&quot; style=&quot;display: inline-block; padding: 16px 36px; font-family: &#39;Source Sans Pro&#39;, Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;&quot;>${confirmationCode}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- end button -->

          <!-- start copy -->
          <tr>
            <td align=&quot;left&quot; bgcolor=&quot;#ffffff&quot; style=&quot;padding: 24px; font-family: &#39;Source Sans Pro&#39;, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;&quot;>
              <p style=&quot;margin: 0;&quot;>If you didn&#39;t create an account with <a href=&quot;https://procertify.netlify.app&quot;>ProCertify</a>, you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end copy -->

          <!-- start copy -->
          <tr>
            <td align=&quot;left&quot; bgcolor=&quot;#ffffff&quot; style=&quot;padding: 24px; font-family: &#39;Source Sans Pro&#39;, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf&quot;>
              <p style=&quot;margin: 0;&quot;>Cheers,<br> ProCertify</p>
            </td>
          </tr>
          <!-- end copy -->

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end copy block -->

    <!-- start footer -->
    <tr>
      <td align=&quot;center&quot; bgcolor=&quot;#e9ecef&quot; style=&quot;padding: 24px;&quot;>
        <!--[if (gte mso 9)|(IE)]>
        <table align=&quot;center&quot; border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;600&quot;>
        <tr>
        <td align=&quot;center&quot; valign=&quot;top&quot; width=&quot;600&quot;>
        <![endif]-->
        <table border=&quot;0&quot; cellpadding=&quot;0&quot; cellspacing=&quot;0&quot; width=&quot;100%&quot; style=&quot;max-width: 600px;&quot;>

          <!-- start permission -->
          <tr>
            <td align=&quot;center&quot; bgcolor=&quot;#e9ecef&quot; style=&quot;padding: 12px 24px; font-family: &#39;Source Sans Pro&#39;, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;&quot;>
              <p style=&quot;margin: 0;&quot;>You received this email because we received a request to link a wallet to your email address. If you didn&#39;t request this, you can safely delete this email.</p>
            </td>
          </tr>
          <!-- end permission -->

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
    <!-- end footer -->

  </table>
  <!-- end body -->

</body>
</html>
`
