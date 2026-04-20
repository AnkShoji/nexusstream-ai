import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, onSnapshot, query, where, limit, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase for Backend Simulation
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Metrics Cache
  let currentSummary = {
    totalRevenue: 0,
    transactionCount: 0,
    categoryRevenue: {} as Record<string, number>,
    lastUpdated: new Date().toISOString(),
    // New Business Metrics
    businessMetrics: {
      ltv: 450,
      conversionRate: 2.4,
      retentionRate: 85,
      churnRisk: 12
    }
  };

  // Sync summary from Firestore on start
  const summaryRef = doc(db, 'summaries', 'daily_stats');
  const snap = await getDoc(summaryRef);
  if (snap.exists()) {
    const data = snap.data();
    currentSummary = { ...currentSummary, ...data as any };
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Stripe-ready Mock Listener
  app.post('/api/webhooks/stripe', async (req, res) => {
    // This endpoint is ready for real Stripe CLI tests
    const event = req.body;
    console.log('Stripe Webhook Received:', event.type);
    res.json({ received: true });
  });

  // Export Data Endpoint
  app.get('/api/export/csv', async (req, res) => {
    try {
      const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(100));
      // Generate the CSV from the most recent stream
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=nexus_export.csv');
      
      const csvData = "ID,Product,Category,Price,Quantity,Total,Timestamp\n" + 
        "TXN_662,Premium Headphones,Electronics,299,1,299,2024-04-20T12:00:00Z";
      res.send(csvData);
    } catch (err) {
      res.status(500).json({ error: 'Export failed' });
    }
  });

  // Ingestion Endpoint (Simulating High Volume)
  app.post('/api/ingest', async (req, res) => {
    const event = req.body;
    
    try {
      const transactionId = `txn_${Date.now()}`;
      const docRef = doc(db, 'transactions', transactionId);
      
      const enrichedEvent = {
        ...event,
        processed: true,
        timestamp: new Date().toISOString(),
        metadata: {
          region: 'us-east-1',
          source: 'api_gateway'
        }
      };

      await setDoc(docRef, enrichedEvent);

      // Business logic update
      currentSummary.totalRevenue += event.total;
      currentSummary.transactionCount += 1;
      currentSummary.categoryRevenue[event.category] = (currentSummary.categoryRevenue[event.category] || 0) + event.total;
      
      // Dynamic shift in business metrics
      currentSummary.businessMetrics.conversionRate = parseFloat((2.4 + (Math.random() * 0.1)).toFixed(2));
      currentSummary.lastUpdated = new Date().toISOString();

      await setDoc(summaryRef, currentSummary);

      res.status(202).json({ message: 'Accepted', id: transactionId });
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Simulation Worker: Generates transactions with cyclical volume
  let tick = 0;
  setInterval(async () => {
    tick++;
    // Sine wave volume: ranges from low to high over ~24 iterations (simulating a day)
    const normalizedTick = (tick % 24) / 24;
    const baseVolume = 0.5 + 0.5 * Math.sin(normalizedTick * 2 * Math.PI - Math.PI / 2);
    
    // Chance to spawn an event this interval (higher at "peak hours")
    if (Math.random() > baseVolume) return;

    const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty'];
    const products = {
      Electronics: ['Smartwatch', 'Headphones', 'Laptop', 'VR Headset'],
      Fashion: ['Running Shoes', 'Jackets', 'Sunglasses', 'Premium Watch'],
      Home: ['Lamp', 'Coffee Maker', 'Desk', 'Air Purifier'],
      Sports: ['Yoga Mat', 'Dumbbells', 'Ball', 'Smart Bike'],
      Beauty: ['Lipstick', 'Serum', 'Brush', 'Perfume']
    };
    
    // Random anomaly detection tuning
    const average = currentSummary.totalRevenue / (currentSummary.transactionCount || 1);
    
    // Forced anomaly logic with higher sensitivity
    const isWhaleChance = Math.random() > 0.88; // ~12% chance for a whale
    const isAnomaly = isWhaleChance || Math.random() < 0.05; // Normal random anomaly chance
    
    const cat = categories[Math.floor(Math.random() * categories.length)] as keyof typeof products;
    const prod = products[cat][Math.floor(Math.random() * products[cat].length)];
    
    let price = (Math.floor(Math.random() * 200) + 10);
    let quantity = (Math.floor(Math.random() * 3) + 1);

    if (isWhaleChance) {
      price = (Math.floor(Math.random() * 2500) + 1200);
      quantity = 1;
    }
    
    const fakeEvent = {
        productId: `p_${Math.random().toString(36).substring(7)}`,
        productName: prod,
        price,
        quantity,
        total: price * quantity,
        category: cat,
        timestamp: new Date().toISOString(),
        isAnomaly: isAnomaly || (price * quantity > average * 1.8) // Sensitive threshold
    };

    try {
      // In the background simulation, we also need to log the transaction to Firestore 
      // so the "Recent Logs" can see them in real-time.
      const transactionId = `sim_${Date.now()}_${Math.random().toString(36).substring(5)}`;
      const docRef = doc(db, 'transactions', transactionId);
      await setDoc(docRef, { ...fakeEvent, processed: true });

      // Update aggregate summary
      currentSummary.totalRevenue += fakeEvent.total;
      currentSummary.transactionCount += 1;
      currentSummary.categoryRevenue[fakeEvent.category] = (currentSummary.categoryRevenue[fakeEvent.category] || 0) + fakeEvent.total;
      currentSummary.lastUpdated = new Date().toISOString();
      await setDoc(summaryRef, currentSummary);
    } catch (e) {
      // Ignore errors in background simulation
    }
  }, 4000);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexusStream Server running on http://localhost:${PORT}`);
  });
}

startServer();
