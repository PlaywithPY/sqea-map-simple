// app/api/map/state/route.js
export async function GET() {
  try {
    console.log('🔄 Proxy: Fetching from backend...');
    const backendResponse = await fetch('https://sqea-backend.onrender.com/api/map/state', {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!backendResponse.ok) {
      console.error('❌ Proxy: Backend error', backendResponse.status);
      return new Response(JSON.stringify({ 
        error: `Backend responded with ${backendResponse.status}`,
        camp: { x: 4, y: 4 },
        revealedCells: [{ x: 4, y: 4, biome: 'camp' }],
        accessibleCells: [],
        exploringCells: [],
        cellDetails: {}
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
    
    const data = await backendResponse.json();
    console.log('✅ Proxy: Data received');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch map data',
      camp: { x: 4, y: 4 },
      revealedCells: [{ x: 4, y: 4, biome: 'camp' }],
      accessibleCells: [],
      exploringCells: [],
      cellDetails: {}
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
