import { Control, Controller } from "react-hook-form"

import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"

type FileInputProps = {
    control: Control,
    name: string,
    [key: string]: any
}

export default function FileInput (props: FileInputProps) {
    const { control, name, ...rest } = props

    return (
        <Controller control={control} name={name} render={({ field }) => (
            <Grid 
                container 
                spacing={2} 
                direction="row" 
                alignItems="center"
                {...rest}
            >
                <Grid item xs={10}>
                    <TextField
                        value={field.value ? field.value.name : ''}
                        disabled
                        fullWidth
                    />
                </Grid>
                <Grid item xs={2}>
                    <label htmlFor="file-upload">
                        <input id="file-upload" 
                            type="file"
                            onChange={(event) => field.onChange(event.target.files![0])}
                            hidden
                        />
                        <Button variant="contained" component="span">Choose image</Button>
                    </label>
                </Grid>
            </Grid>
        )} />
    )
}