import { UseFormReturn, useFieldArray } from "react-hook-form"

import Box from '@mui/material/Box'

import ControlledTextField from "./ControlledTextField"
import FileInput from "./FileInput"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import { useEffect } from "react"

type CreateNewProps = {
    form: UseFormReturn
}

type Attributes = {
    key: string
    value: string
}[]

export default function CreateNew(props: CreateNewProps) {
    const { control, watch, reset } = props.form
    const { fields: attributes, append, remove } = useFieldArray({
        control,
        name: 'attributes'
    })

    const image = watch('image')
    const attributesWatch = watch('attributes') as Attributes

    useEffect(() => {
        reset({
            image: null,
            attributes: [
                { key: 'Name', value: '' },
                { key: 'Description', value: '' },
                { key: '', value: '' }
            ]
        })
    }, [])

    return (
        <Box
            display='flex'
            alignItems='center'
            p={2}
            sx={{ flexDirection: 'column', gap: 2 }}
        >
            {image && <img
                src={URL.createObjectURL(image)}
                alt="preview"
                style={{ width: '500px', height: 'auto' }}
            />}
            <FileInput control={control} name="image" />
            {attributes.map((attribute, index) => (
                <Grid container spacing={2} direction="row">
                    <Grid item xs={5}>
                        <ControlledTextField
                            name={`attributes.${index}.key`}
                            control={control}
                            label="Key"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={5}>
                        <ControlledTextField
                            name={`attributes.${index}.value`}
                            control={control}
                            label="Value"
                            fullWidth
                        />
                    </Grid>
                    { attributesWatch[index].key !== 'Name' 
                    && attributesWatch[index].key !== 'Description' && (
                        <Grid item xs={1}>
                            <Button variant="contained" onClick={() => remove(index)}>Remove</Button>
                        </Grid>
                    )}

                </Grid>
            ))}
            <Button
                variant="contained"
                onClick={() => append({ key: '', value: '' })}
            >
                Add attribute
            </Button>
        </Box>
    )
}