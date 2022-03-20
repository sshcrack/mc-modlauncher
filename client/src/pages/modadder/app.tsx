import { Flex, Spinner, Text } from '@chakra-ui/react'
import * as React from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { Globals } from '../../Globals'

export default function ModAdder() {
    const [mods, setMods] = React.useState([])

    const fetchMore = () => {
        const itemsPerPage = 50
        console.log("Fetching...")
        fetch(`https://localhost:8080/api/v1/mods/search?gameId=432&classId=6&sortField=2&sortOrder=desc&pageSize=${itemsPerPage}&index=${mods.length}`)
            .then(e => e.json())
            .then(res => {
                const { data } = res;
                console.log("res",res)
                setMods(mods.concat(data))
            })
    }

    React.useEffect(() => {
        fetchMore()
    }, [])

    return <Flex
        flexDir='column'
        h='100%'
        w='100%'
    >
        <InfiniteScroll
            dataLength={mods.length}
            next={fetchMore}
            hasMore={true}
            loader={<Spinner />}
            style={{ height: '100%', width: "100%" }}
        >
            {mods.map((mod, index) => {
                return <Text key={index}>
                    Modpack is { mod } {index}
                </Text>
            })}
        </InfiniteScroll>
    </Flex>
}