import type { AppProps } from 'next/app'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import { CacheProvider, EmotionCache } from '@emotion/react'
import createCache from '@emotion/cache'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

import theme from '@/config/theme'
import { Database } from '@/types/supabase'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createCache({ key: 'css' })

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({ Component, pageProps }: AppProps) {
  const { emotionCache = clientSideEmotionCache, ...other } = pageProps as MyAppProps

  const [supabase] = useState(() => createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
          <Component {...other} />
        </SessionContextProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}
