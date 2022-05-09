import { Flex, Spinner, Text } from '@chakra-ui/react'
import * as React from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { Globals } from '../../Globals'

const mcGameId = 432
export default function ModAdder() {
    const [mods, setMods] = React.useState([])
    const [ hasMore, setHasMore ] = React.useState(true)

    const fetchMore = () => {
        const itemsPerPage = 50
        console.log("Fetching...")
        fetch(`${Globals.baseUrl}/api/v1/mods/search?gameId=${mcGameId}&classId=6&sortField=2&sortOrder=desc&pageSize=${itemsPerPage}&index=${mods.length}`)
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
                    Modpack is { mod.slug } {index}
                </Text>
            })}
        </InfiniteScroll>
    </Flex>
}