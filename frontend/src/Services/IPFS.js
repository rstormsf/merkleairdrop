// import IPFS from "ipfs-api"
const IPFS = window.IpfsApi

const ipfs = IPFS("ipfs.bluffbet.app", "443", { protocol: "https" })
// const ipfs = new IPFS({ host: "localhost" })

export const upload = async data => {
    return await ipfs.files.add(Buffer.from(data, "utf8"))
}

export const cat = async hash => {
    const file = await ipfs.files.cat(hash)
    return file.toString("utf8")
}
