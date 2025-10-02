// pages/api/map/state.js
export default async function handler(req, res) {
  try {
    const backendResponse = await fetch('https://sqea-backend.onrender.com/api/map/state');
    
    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }
    
    const data = await backendResponse.json();
    
    // Configure CORS pour ton domaine
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}
