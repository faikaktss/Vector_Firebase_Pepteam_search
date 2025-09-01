
const admin = require('firebase-admin');
const { pipeline } = require('@xenova/transformers');
const { v4: uuidv4 } = require('uuid');
const { QdrantClient } = require('@qdrant/qdrant-js');
const serviceAccount = require('../firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getFirebaseData(collectionName) {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function main() {
    const data = await getFirebaseData('customers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const client = new QdrantClient({ url: 'http://localhost:6333' });

    await client.recreateCollection('firebasee_stores', {
        vectors: {
            size: 384,
            distance: 'Cosine'
        }
    });

    for (const item of data) {
        const text = `
            ${item.name || ''}
            ${item.address || ''}
            ${item.industry || ''}
            ${item.customIndustry || ''}
            ${item.currentPlan || ''}
            ${item.email || ''}
            ${item.phone || ''}
            ${item.bookingUrl || ''}
            ${item.appointmentCount !== undefined ? item.appointmentCount : ''}
            ${item.customerCount !== undefined ? item.customerCount : ''}
        `;
        const embedding = await embedder(text).then(arr => arr[0][0]);
        const vector = Array.isArray(embedding) ? embedding : Array.from(embedding.data);

        await client.upsert('firebasee_stores', {
            points: [{
                id: uuidv4(),
                vector,
                payload: item
            }]
        });
    }

    console.log('Firebase verileri Qdrant\'a eklendi');
}

main();