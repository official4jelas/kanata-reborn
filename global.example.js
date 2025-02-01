// variabel dasar
globalThis.owner = "";
globalThis.ownerNumber = ""
globalThis.botNumber = ""
globalThis.sessionName = ''

// fungsi dasar
globalThis.isOwner = (id) => {
    return id === globalThis.ownerNumber
}
globalThis.isBot = async (id) => {
    return id === botNumber
}

globalThis.isGroup = (jid) => {
    return jid.endsWith('@g.us')
}
// variabel apikey
globalThis.apiKey = {
    gemini: '',
    gpt: '',
    mistral: '',
    removeBG: '',
    llama: '',
    groq: '',
    pdf: {
        secret: '',
        public: ''
    }
}

// variabel paired apikey with baseurl
globalThis.apiHelper = {
    medanpedia: {
        baseurl: 'https://api.medanpedia.co.id/',
        apiId: '',
        apiKey: ''
    },
    lolhuman: {
        apikey: '',
        baseUrl: 'https://api.lolhuman.xyz/api/'
    },
    neoxr: {
        apikey: '',
        baseUrl: 'https://api.neoxr.eu/api/'
    },
    ryzen: {
        apikey: '',
        baseUrl: 'https://apidl.asepharyana.cloud/api/'
    },
    fastapi: {
        apikey: '',
        baseUrl: 'https://fastrestapis.fasturl.cloud/'
    },
    betabotz: {
        apikey: '',
        baseUrl: 'https://api.betabotz.eu.org/api/'
    },
    skizotech: {
        apikey: '',
        baseUrl: 'https://skizoasia.xyz/api/'
    },
    nyxs: {
        apikey: '',
        baseUrl: 'https://api.nyxs.pw/'
    }
}
