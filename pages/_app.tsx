import type { AppProps } from 'next/app'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import { CacheProvider, EmotionCache } from '@emotion/react'
import createCache from '@emotion/cache'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { WalletProvider } from '@/context/wallet'

import theme from '@/config/theme'
import Head from 'next/head'
import { TezosProvider } from '@/context/tezos'
import { NFTStorageProvider } from '@/context/ipfs'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createCache({ key: 'css' })

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({ Component, pageProps }: AppProps) {  
  const { emotionCache = clientSideEmotionCache, ...other } = pageProps as MyAppProps

  const [supabase] = useState(() => createBrowserSupabaseClient())

  return (
    <>
      <Head>
        <title>ProCertify</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
            <WalletProvider>
              <TezosProvider>
                <NFTStorageProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Component {...other} />
                  </LocalizationProvider>
                </NFTStorageProvider>
              </TezosProvider>
            </WalletProvider>
          </SessionContextProvider>
        </ThemeProvider>
      </CacheProvider>
    </>
  )
}
