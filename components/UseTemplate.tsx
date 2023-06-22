import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { UseFormReturn } from 'react-hook-form'
import { useMemo, useState, useEffect } from 'react'
import dayjs from 'dayjs'

import Container from '@mui/material/Container'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'

import { getTemplates } from '@/pages/mint'

import ControlledTextField from '@/components/ControlledTextField'
import ControlledDatePicker from '@/components/ControlledDatePicker'
import { useRouter } from 'next/router'

type Templates = Awaited<ReturnType<typeof getTemplates>>

type UseTemplateProps = {
    templates: Templates,
    form: UseFormReturn,
    initialTemplate?: string
}

export default function UseTemplate(props: UseTemplateProps) {
    const router = useRouter()
    const { templates, form } = props
    const { watch, control, setValue } = form

    const [index, setIndex] = watch('index')

    const template = useMemo(() => {
        for (const attribute of templates[index].attributes) {
            switch (attribute.types!.name) {
                case 'text':
                    setValue(attribute.svg_id, '')
                    break
                case 'date':
                    setValue(attribute.svg_id, dayjs())
            }
        }

        return templates[index]
    }, [index])

    useEffect(() => {
        if (router.query.template) {
            const index = templates.findIndex(template => template.id === router.query.template)
            setValue('index', index)
        }
    }, [])


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
                            text = watch(svg_id)
                            break
                        case 'date':
                            text = watch(svg_id).format('DD/MM/YYYY')
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

    const svg = useMemo(() => {
        return parse(template!.image, options)
    }, [watch()])

    return (
        <Box
            display='flex'
            alignItems='center'
            p={2}
            sx={{ flexDirection: 'column', gap: 2 }}
        >
            <Container>
                <FormControl>
                    <InputLabel>Template</InputLabel>
                    <Select
                        value={index}
                        onChange={e => setIndex(e.target.value as number)}
                        label="Template"
                    >
                        {templates.map((template, index) => (
                            <MenuItem value={index} key={template.id}>{template.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Container>
            {svg}
            <Container>
                {template.attributes.map(attribute => {
                    const { name, types, svg_id } = attribute
                    switch (types!.name) {
                        case 'text':
                            return (
                                <ControlledTextField
                                    name={svg_id}
                                    control={control}
                                    label={name}
                                    key={name}
                                    fullWidth
                                    sx={{ mt: 3 }}
                                />
                            )
                        case 'date':
                            return (
                                <ControlledDatePicker
                                    name={svg_id}
                                    control={control}
                                    label={name}
                                    key={name}
                                    sx={{ mt: 3 }}
                                />
                            )
                    }
                })}
            </Container>
        </Box>
    )
}