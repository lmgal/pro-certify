import { Dayjs } from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Control, Controller } from 'react-hook-form'

type ControlledDatePickerProps = {
    control: Control,
    name: string,
    label: string,
    [key: string]: any
}

export default function ControlledDatePicker (props: ControlledDatePickerProps) {
    const { control, name, label, ...rest } = props

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <DatePicker
                    label={label}
                    value={value}
                    onChange={onChange}
                    {...rest}
                />
            )}
        />
    )
}