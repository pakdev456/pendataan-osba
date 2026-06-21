// Konfigurasi CORS
const getCorsHeaders = (origin: string) => {
  // Ganti dengan domain frontend Anda yang sebenarnya jika sudah dipublikasikan
  const allowedOrigins = ["https://pendataan-osba.vercel.app", "http://localhost:5173"];
  const isAllowed = allowedOrigins.includes(origin);
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Accept, Accept-Language",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
};

const BENDAHARA_PASSWORD = Deno.env.get('PASSWORD_BENDAHARA');
const KOBER_PASSWORD = Deno.env.get('PASSWORD_KOBER');
async function verifyPassword(username: string, password: string): Promise<boolean> {
  const expected = CREDENTIALS[username];
  return expected !== undefined && password === expected;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  // 1. Handle Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Login
    if (url.pathname.endsWith('/login') && req.method === 'POST') {
      const { username, password } = await req.json();

      if (!(await verifyPassword(username, password))) {
        return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userResponse = await fetch(
        `${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=id,username,name,role`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const users = await userResponse.json();

      if (!users || users.length === 0) {
        return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const user = users[0];
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await fetch(`${supabaseUrl}/rest/v1/sessions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ user_id: user.id, token, expires_at: expiresAt.toISOString() }),
      });

      return new Response(JSON.stringify({ user, token }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Verify
    if (url.pathname.endsWith('/verify') && req.method === 'POST') {
      const { token } = await req.json();
      const sessionResponse = await fetch(
        `${supabaseUrl}/rest/v1/sessions?token=eq.${token}&select=*,users(id,username,name,role)&expires_at=gt.${new Date().toISOString()}`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const sessions = await sessionResponse.json();

      if (!sessions || sessions.length === 0) {
        return new Response(JSON.stringify({ valid: false }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ valid: true, user: sessions[0].users }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Logout
    if (url.pathname.endsWith('/logout') && req.method === 'POST') {
      const { token } = await req.json();
      await fetch(`${supabaseUrl}/rest/v1/sessions?token=eq.${token}`, {
        method: 'DELETE',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
