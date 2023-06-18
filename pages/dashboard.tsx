import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import NavbarDrawer from '@/components/NavbarDrawer'
import Copyright from '@/components/Copyright'
import Templates from '@/components/Templates'

import { Database } from '@/types/supabase'

type DashboardProps = {
    templates: { 
        id: string,
        name: string,
        imageUrl: string
    }[] | null
}

export default function Dashboard(props: DashboardProps) {
    const { templates } = props

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
                        {/* Chart */}
                        <Grid item xs={12} >
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 240,
                                }}
                            >
                                <Templates templates={templates} height={240} />
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
        const { data: images } = await supabase
            .storage
            .from('templates')
            .createSignedUrls(
                templates.map(template => template.id + '.svg'),
                60
            )

        return {
            props: {
                templates: templates.map((template, index) => {
                    return {
                        ...template,
                        imageUrl: images![index].signedUrl
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