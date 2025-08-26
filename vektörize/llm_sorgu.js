const prompt = require('prompt-sync')();
const { pipeline } = require('@xenova/transformers');
const { QdrantClient } = require('@qdrant/qdrant-js');

const question = prompt('Ne öğrenmek istersiniz: ');
const province = prompt('Şehir (boş bırakabilirsin): ');
const service = prompt('Hizmet (boş bırakabilirsin): ');

async function queryQdrant(question, province, service) {
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embedding = await embedder(question).then(arr => arr[0][0]);
    const vector = Array.isArray(embedding) ? embedding : Array.from(embedding.data);

    const client = new QdrantClient({ url: 'http://localhost:6333' });

    let filter = { must: [] };
    if (province) {
        filter.must.push({
            key: 'province',
            match: { value: province }
        });
    }
    if (service) {
        filter.must.push({
            key: 'services',
            match: { value: service }
        });
    }
    if (filter.must.length === 0) filter = undefined;

    const searchResult = await client.search('pepteam_stores', {
        vector: vector,
        limit: 5,
        filter: filter
    });

    if (!searchResult || searchResult.length === 0) {
        console.log('Hiçbir sonuç bulunamadı. Şehir veya hizmet adını yanlış girmiş olabilirsiniz.');
    } else {
        let found = false;
        searchResult.forEach((result, i) => {
            if (result.score >= 0.7) {
                found = true;
                console.log(`Sonuç ${i + 1}:`, result.payload);
                console.log('Benzerlik skoru:', result.score);
                console.log('-----------------------------');
            }
        });
        if (!found) {
            console.log('Hiçbir sonuç bulunamadı. Şehir veya hizmet adını yanlış girmiş olabilirsiniz.');
        }
    }
}

queryQdrant(question, province, service);