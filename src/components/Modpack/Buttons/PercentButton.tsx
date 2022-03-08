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
    return <Button
        flex='1'
        pos='relative'
        _hover={{ bg: hover }}
        onClick={onClick}
        bg={processing ? "gray.300" : bg}
    >
        <Box
            pos='absolute'
            w={(progress?.percent ?? 0) * 100 + "%"}
            h='100%'
            bg={processing ? bg : "transparent"}
            left='0'
            top='0'
            borderRadius='md'
        />
        {
            processing ?
                <Text zIndex='100'>
                    {progress.status ?? "No Information"}
                </Text>
                :
                children
        }
    </Button>
}