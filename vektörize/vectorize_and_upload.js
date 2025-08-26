const fs = require('fs');
const { pipeline } = require('@xenova/transformers');
const { QdrantClient } = require('@qdrant/qdrant-js');
const { v4: uuidv4 } = require('uuid');

const data = JSON.parse(fs.readFileSync('database/pepteam_stores_10000_real_provinces.json', 'utf-8'));

const texts = data.map((store, idx) =>
    `Mağaza ${idx + 1}: Notlar: ${store.notes || ''}`
);

async function getEmbeddings(texts) {
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    return await Promise.all(texts.map(text => embedder(text).then(arr => arr[0][0])));
}

async function uploadToQdrant(vectors, data) {
    const client = new QdrantClient({ url: 'http://localhost:6333' });

    await client.recreateCollection('pepteam_stores', {
        vectors: {
            size: vectors[0].length,
            distance: 'Cosine'
        }
    });

    const points = vectors.map((vector, idx) => ({
        id: uuidv4(),
        vector,
        payload: data[idx]
    }));

    for (let i = 0; i < points.length; i += 1000) {
        await client.upsert('pepteam_stores', {
            points: points.slice(i, i + 1000)
        });
        console.log(`${Math.min(i + 1000, points.length)} kayıt yüklendi`);
    }
}

getEmbeddings(texts).then(async embeddings => {
    const vectors = embeddings.map(e => Array.isArray(e) ? e : Array.from(e.data));
    console.log('İlk vektör:', vectors[0]);
    await uploadToQdrant(vectors, data);
    console.log('Tüm veriler Qdrant\'a yüklendi');
});