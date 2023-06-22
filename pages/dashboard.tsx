import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import NavbarDrawer from '@/components/NavbarDrawer'
import Copyright from '@/components/Copyright'
import Certificates from '@/components/Certificates'

import { Database } from '@/types/supabase'

type DashboardProps = {
    certificates: { 
        id: string,
        name: string,
        imageUrl: string
    }[] | null
}

export default function Dashboard(props: DashboardProps) {
    const { certificates: templates } = props

    return (
        <Box sx={{ display: 'flex' }}>
            <NavbarDrawer />
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} >
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 240,
                                }}
                            >
                                <Certificates certificates={templates} height={225} />
                            </Paper>
                        </Grid>
                    </Grid>
                    <Copyright sx={{ pt: 4 }} />
                </Container>
            </Box>
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const supabase = createServerSupabaseClient<Database>(context)
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    // Fetch templates
    const { data: templates } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', session.user.id)

    // Fetch images for templates
    if (templates && templates.length > 0) {
        // Template bucket is public for now
        const images = templates.map((template) => {
            const { data: image } = supabase
                .storage
                .from('templates')
                .getPublicUrl(template.id)

            return image.publicUrl
        })

        return {
            props: {
                templates: templates.map((template, index) => {
                    return {
                        ...template,
                        imageUrl: images[index]
                    }
                })
            }
        }
    }

    return {
        props: {
            templates: null
        }
    }
}