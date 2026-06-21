import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CREDENTIALS: Record<string, string> = {
  bendahara: "babussalamsc26",
  kober: "ibadah2026",
};

async function verifyPassword(username: string, password: string): Promise<boolean> {
  const expected = CREDENTIALS[username];
  if (!expected) return false;
  return password === expected;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    if (url.pathname.endsWith('/login') && req.method === 'POST') {
      const { username, password } = await req.json();

      const isValid = await verifyPassword(username, password);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user from DB
      const userResponse = await fetch(
        `${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=id,username,name,role`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
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

      return new Response(JSON.stringify({
        user: { id: user.id, username: user.username, name: user.name, role: user.role },
        token,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname.endsWith('/verify') && req.method === 'POST') {
      const { token } = await req.json();

      const sessionResponse = await fetch(
        `${supabaseUrl}/rest/v1/sessions?token=eq.${token}&select=*,users(id,username,name,role)&expires_at=gt.${new Date().toISOString()}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      const sessions = await sessionResponse.json();

      if (!sessions || sessions.length === 0) {
        return new Response(JSON.stringify({ valid: false }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const session = sessions[0];
      return new Response(JSON.stringify({
        valid: true,
        user: {
          id: session.users.id,
          username: session.users.username,
          name: session.users.name,
          role: session.users.role,
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname.endsWith('/logout') && req.method === 'POST') {
      const { token } = await req.json();
      await fetch(`${supabaseUrl}/rest/v1/sessions?token=eq.${token}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
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
