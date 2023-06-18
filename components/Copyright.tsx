import { TypographyProps } from "@mui/material"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"

export default function Copyright(props: TypographyProps) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href={process.env.NEXT_PUBLIC_BASE_URL}>
                ProCertify
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    )
}