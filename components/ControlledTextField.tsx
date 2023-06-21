import { TextField } from "@mui/material"
import { Controller, Control } from "react-hook-form"

type ControlledTextFieldProps = {
    name: string,
    control: Control,
    [key: string]: any
}

export default function ControlledTextField(props: ControlledTextFieldProps) {
    const { name, control, ...rest } = props

    return (
        <Controller control={control} name={name}
        render={({field, fieldState}) => (
            <TextField 
                value={field.value} 
                onChange={field.onChange}
                helperText={fieldState.error?.message}
                inputRef={field.ref} 
                required
                {...rest} />
        )} />
    )
}