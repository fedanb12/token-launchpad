import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    where,
    updateDoc,
    increment
} from 'firebase/firestore';

const TOKENS_COLLECTION = 'tokens';
const TRADES_COLLECTION = 'trades';

// Save a newly launched token to Firestore
export const saveToken = async (tokenData) => {
    try {
        await addDoc(collection(db, TOKENS_COLLECTION), {
            ...tokenData,
            createdAt: Date.now(),
            tradeCount: 0,
            volume: 0,
        });
    } catch (e) {
        console.error("Error saving token:", e);
    }
};

// Get all tokens
export const getTokens = async () => {
    try {
        const q = query(collection(db, TOKENS_COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting tokens:", e);
        return [];
    }
};

// Get a single token by contract address
export const getToken = async (address) => {
    try {
        const q = query(collection(db, TOKENS_COLLECTION), where('tokenAddress', '==', address));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (e) {
        console.error("Error getting token:", e);
        return null;
    }
};

// Get tokens by creator
export const getTokensByCreator = async (address) => {
    try {
        const q = query(collection(db, TOKENS_COLLECTION), where('creator', '==', address), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting creator tokens:", e);
        return [];
    }
};

// Save a trade
export const saveTrade = async (tradeData) => {
    try {
        await addDoc(collection(db, TRADES_COLLECTION), {
            ...tradeData,
            timestamp: Date.now(),
        });
    } catch (e) {
        console.error("Error saving trade:", e);
    }
};

// Get trades for a token
export const getTradesForToken = async (tokenAddress) => {
    try {
        const q = query(
            collection(db, TRADES_COLLECTION),
            where('tokenAddress', '==', tokenAddress),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting trades:", e);
        return [];
    }
};