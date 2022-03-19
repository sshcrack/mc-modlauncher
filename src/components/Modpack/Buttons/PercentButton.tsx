import { Box, Button, Text } from '@chakra-ui/react'
import React, { ReactElement } from 'react'
import { Progress } from '../../../backend/InstallManager/event/interface'

export default function PercentButton({ hover, bg, processing, onClick, progress, children }: {
    hover: string,
    bg: string,
    processing: boolean,
    onClick: () => void,
    progress: Progress,
    children: ReactElement
}) {
    const processingColor = "gray.500"

    return <Button
        flex='1'
        pos='relative'
        _hover={{ bg: processing ? processingColor : hover }}
        onClick={onClick}
        bg={processing ? processingColor : bg}
    >
        <Box
            pos='absolute'
            w={(progress?.percent ?? 0) * 100 + "%"}
            h='100%'
            bg={processing ? bg : "transparent"}
            left='0'
            top='0'
            borderRadius='md'
            transition='all 1s ease-in-out'
        />
        {
            processing ?
                <Text zIndex='100'>
                    {progress.status ?? "No Information"} {progress?.percent * 100 ?? 0}%
                </Text>
                :
                children
        }
    </Button>
}