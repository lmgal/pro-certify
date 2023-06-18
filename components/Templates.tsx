import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Link from 'next/link'
import { Tooltip } from '@mui/material'


type TemplatesProps = {
    templates: {
        id: string,
        name: string,
        imageUrl: string,
    }[] | null,
    height: string | number
}

export default function Templates(props: TemplatesProps) {
    const { templates, height } = props

    return (
        <>
            <Typography component="h2" variant="h6" color="primary">Templates</Typography>
            <Typography component="h3" variant="caption" gutterBottom>
                Start by clicking a template to mint your NFT
            </Typography>
            {templates?.length! > 0 ? (
                <ImageList sx={{ minHeight: height }} cols={12} gap={8}>
                    <ImageListItem key="Subheader" />
                    {templates?.map(template => (
                        <ImageListItem key={template.id}>
                            <Link href={`/mint?templateId=${template.id}`}>
                                <img
                                    src={template.imageUrl}
                                    alt={template.name}
                                    loading='lazy'
                                    width={300}
                                />
                            </Link>
                            <ImageListItemBar
                                title={template.name}
                                actionIcon={
                                    <Tooltip title='Edit template'>
                                        <IconButton
                                            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            ) : (
                <Box minHeight={height} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant='body1' textAlign='center'>
                        Seems empty here, try creating a template first
                    </Typography>
                </Box>
            )
            }
        </>
    )
}