import express from 'express';
import cors from 'cors';
import { 
    ytShorts,
    spotifyDownload,
    rednote,
    pddiktiSearch,
    mahasiswaDetail,
    pinterest,
    shutterstock,
    memberJkt,
    detailMember
} from './src/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Scraper',
            version: '1.0.0',
            description: 'Dokumentasi API untuk berbagai layanan scraping'
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Server Development'
            }
        ],
        tags: [
            {
                name: 'Youtube',
                description: 'Endpoint untuk scraping Youtube Shorts'
            },
            {
                name: 'Spotify',
                description: 'Endpoint untuk scraping Spotify'
            },
            {
                name: 'RedNote',
                description: 'Endpoint untuk scraping RedNote'
            },
            {
                name: 'Pinterest',
                description: 'Endpoint untuk scraping Pinterest'
            },
            {
                name: 'Shutterstock',
                description: 'Endpoint untuk scraping Shutterstock'
            },
            {
                name: 'PDDIKTI',
                description: 'Endpoint untuk scraping data PDDIKTI'
            },
            {
                name: 'JKT48',
                description: 'Endpoint untuk scraping data JKT48'
            }
        ],
        paths: {
            '/api/ytshorts': {
                get: {
                    summary: 'Mengambil data dari Youtube Shorts',
                    tags: ['Youtube'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'url',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'URL Youtube Shorts'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter URL tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/spotify': {
                get: {
                    summary: 'Mengambil data dari Spotify',
                    tags: ['Spotify'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'url',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'URL Spotify'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter URL tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/rednote': {
                get: {
                    summary: 'Mengambil data dari RedNote',
                    tags: ['RedNote'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'url',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'URL RedNote'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter URL tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/pinterest': {
                get: {
                    summary: 'Mengambil data dari Pinterest',
                    tags: ['Pinterest'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'url',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'URL Pinterest'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter URL tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/shutterstock': {
                get: {
                    summary: 'Mengambil data dari Shutterstock',
                    tags: ['Shutterstock'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'url',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'URL Shutterstock'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter URL tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/pddikti/search': {
                get: {
                    summary: 'Mencari data mahasiswa di PDDIKTI',
                    tags: ['PDDIKTI'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'q',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'Kata kunci pencarian'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter query tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/pddikti/detail': {
                get: {
                    summary: 'Mengambil detail mahasiswa dari PDDIKTI',
                    tags: ['PDDIKTI'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'link',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'Link detail mahasiswa'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter link tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/jkt48/members': {
                get: {
                    summary: 'Mengambil daftar member JKT48',
                    tags: ['JKT48'],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            },
            '/api/jkt48/member/{id}': {
                get: {
                    summary: 'Mengambil detail member JKT48',
                    tags: ['JKT48'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'ID member JKT48'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Berhasil mengambil data'
                        },
                        400: {
                            description: 'Parameter ID tidak ditemukan'
                        },
                        500: {
                            description: 'Server error'
                        }
                    }
                }
            }
        }
    },
    apis: ['./scrape-server/main.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/api/ytshorts', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, message: 'URL parameter diperlukan' });
        
        const result = await ytShorts(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/spotify', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, message: 'URL parameter diperlukan' });
        
        const result = await spotifyDownload(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/rednote', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, message: 'URL parameter diperlukan' });
        
        const result = await rednote(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/pinterest', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, message: 'URL parameter diperlukan' });
        
        const result = await pinterest(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/shutterstock', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ status: false, message: 'URL parameter diperlukan' });
        
        const result = await shutterstock(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/pddikti/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ status: false, message: 'Query parameter diperlukan' });
        
        const result = await pddiktiSearch(q);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/pddikti/detail', async (req, res) => {
    try {
        const { link } = req.query;
        if (!link) return res.status(400).json({ status: false, message: 'Link parameter diperlukan' });
        
        const result = await mahasiswaDetail(link);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/jkt48/members', async (req, res) => {
    try {
        const result = await memberJkt();
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.get('/api/jkt48/member/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ status: false, message: 'ID parameter diperlukan' });
        
        const result = await detailMember(id);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
