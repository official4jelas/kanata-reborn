import axios from "axios"

const baseURL = 'https://pddikti.kemdiktisaintek.go.id/'

const pddikti = axios.create({
    baseURL,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml"
    }
})

const getByNim = async (nim) => {
    let { data } = await pddikti.get(`search/${nim}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml"
        }
    })

    return data
}

(async () => {
    console.log(await getByNim('SSI202203088'))
})()

