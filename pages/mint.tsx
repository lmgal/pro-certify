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
import { Button, Tab, Tabs, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Dayjs } from 'dayjs'
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser'

import TabPanel from '@/components/TabPanel'
import UseTemplate from '@/components/UseTemplate'
import CreateNew from '@/components/CreateNew'
import ControlledTextField from '@/components/ControlledTextField'

import { useNFTStorage } from '@/context/ipfs'
import { useTezos } from '@/context/tezos'

import { mint } from '@/util/operations'

type Template = Awaited<ReturnType<typeof getTemplates>>[0]
type MintProps = {
    templates: Template[]
}

type FormValuesType = Record<string, string | Dayjs | File | number>

export default function Mint(props: MintProps) {
    const router = useRouter()
    const useFormReturn = useForm<FormValuesType>({
        defaultValues: {
            index: 0
        }
    })
    const nftStorage = useNFTStorage()
    const tezos = useTezos()

    const { templates } = props
    const { template } = router.query

    const [tab, setTab] = useState(template ? 1 : 0)

    const onSubmit = useFormReturn.handleSubmit(async (data) => {
        const { name, description, image, recipient, ...rest } = data
        // Create new
        if (tab === 0) {
            const metadata = await nftStorage.store({
                name: name as string,
                description: description as string,
                image: new File([image as Blob], 'image.png', { type: 'image/png' }),
                ...rest
            })

            await mint(tezos, [{
                to_: recipient as string,
                ipfs: metadata.url
            }])

            router.push('/dashboard')
        }

        // Use template
        if (tab === 1) {
            const template = templates[rest.index as number]

            const options: HTMLReactParserOptions = {
                replace: (domNode) => {
                    // @ts-ignore
                    const { attribs, children, name: nodeName } = domNode
    
                    if (!attribs)
                        return
    
                    if (nodeName === 'svg') {
                        // Make the width and adjust height with aspect ratio
                        attribs.height = 500 * (attribs.height / attribs.width)
                        attribs.width = 500
    
                        return <svg {
                            ...attribs
                        }>{domToReact(children, options)}</svg>
                    }
    
                    for (const attribute of template.attributes) {
                        const { svg_id, types } = attribute
                        if (attribs.id === svg_id) {
                            let text = ''
                            switch (types!.name) {
                                case 'text':
                                    text = data[svg_id] as string
                                    break
                                case 'date':
                                    text = (data[svg_id] as Dayjs).format('DD/MM/YYYY')
                                    break
                            }
                            if (nodeName === 'text')
                                return <text {...attribs}>
                                    {text}
                                </text>
    
                            if (nodeName === 'tspan') {
                                return <tspan {...attribs}>
                                    {text}
                                </tspan>
                            }
    
                        }
                    }
                }
            }

            const svgText = parse(template.image, options).toString()

            const parsedRest : Record<string, string> = {}
            for (let [key, value] of Object.entries(rest)) {
                if (value instanceof Dayjs)
                    parsedRest[key] = value.format('DD/MM/YYYY')
                
                if (typeof value === 'string')
                    parsedRest[key] = value
            }

            const metadata = await nftStorage.store({
                name: template.name,
                description: template.description ?? '',
                image: new File([svgText], 'image.svg', { type: 'image/svg+xml' }),
                ...parsedRest
            })

            await mint(tezos, [{
                to_: recipient as string,
                ipfs: metadata.url
            }])

            router.push('/dashboard')
        }
    })

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
                                    <CreateNew
                                        form={useFormReturn}
                                    />
                                </TabPanel>
                                <TabPanel value={tab} index={1}>
                                    <UseTemplate
                                        templates={templates}
                                        form={useFormReturn}
                                    />
                                </TabPanel>
                                <Container>
                                    <ControlledTextField
                                        name="recipient"
                                        label="Recipient Wallet Address"
                                        control={useFormReturn.control}
                                        fullWidth
                                    />
                                </Container>
                                <Container>
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        onClick={onSubmit}
                                    >
                                        Mint
                                    </Button>
                                </Container>
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