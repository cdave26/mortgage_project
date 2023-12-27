import axios from 'axios'

export default async () => {
    const { data } = await axios('https://api.ipify.org?format=json')
    return data.ip
}
