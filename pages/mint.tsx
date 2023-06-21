import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { SupabaseClient, createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import NavbarDrawer from '@/components/NavbarDrawer'
import Copyright from '@/components/Copyright'

import { Database } from '@/types/supabase'
import { Button, Select, Tab, Tabs, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useMemo, useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Dayjs } from 'dayjs'

import TabPanel from '@/components/TabPanel'
import UseTemplate from '@/components/UseTemplate'

type Template = Awaited<ReturnType<typeof getTemplates>>[0]
type MintProps = {
    templates: Template[]
}

type FormValuesType = Record<string, string | Dayjs>

export default function Mint(props: MintProps) {
    const router = useRouter()
    const useFormReturn = useForm<FormValuesType>()

    const { templates } = props
    const { template } = router.query

    const [tab, setTab] = useState(template ? 1 : 0)

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
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography variant="h4" component="h1" gutterBottom>
                                    Mint
                                </Typography>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)}>
                                        <Tab label="Create New" />
                                        <Tab label="Use Template" />
                                    </Tabs>
                                </Box>
                                <TabPanel value={tab} index={0}>

                                </TabPanel>
                                <TabPanel value={tab} index={1}>
                                    <UseTemplate 
                                        templates={templates} 
                                        form={useFormReturn}
                                    /> 
                                </TabPanel>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Copyright sx={{ pt: 4 }} />
                </Container>
            </Box>
        </Box>
    )
}

export const getTemplates = async (supabase: SupabaseClient<Database>) => {
    const { data: templates, error } = await supabase
        .from('templates')
        .select(`
            *,
            attributes (
                name,
                svg_id,
                types (
                    name
                )
            )
        `)

    // Temporarily all images are public
    // TODO: Make is_public=false templates fetch from private buckets
    // Otherwise, getPublicUrl
    const images = await Promise.all(templates?.map(async (template) => {
        const { data: { publicUrl } } = supabase.storage
            .from('templates')
            .getPublicUrl(`${template.id}`)
        const res = await axios.get(publicUrl)
        return res.data
    }) ?? [])

    if (error) {
        throw error
    }

    return templates.map((template, index) => {
        return {
            ...template,
            image: images[index] as string
        }
    })
}

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
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
    const templates = await getTemplates(supabase)

    return {
        props: {
            templates
        }
    }
}