import Box from '@mui/material/Box'

type TabPanelProps = {
    index: number,
    value: number,
    children?: React.ReactNode,
    [key: string]: any
}

export default function TabPanel (props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <Box
            hidden={value !== index}
            {...other}
        >
            {value === index && children}
        </Box>
    )
}