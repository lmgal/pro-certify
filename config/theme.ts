import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette: {
        primary: {
            // Dark Green and white play nicely together.
            main: '#1b5e20',
        },
        secondary: {
            main: '#f50057',
        },
    }
})

export default theme