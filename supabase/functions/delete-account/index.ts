import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return Response.json({ error: 'You must be signed in.' }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401, headers: corsHeaders });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  // Retain a minimal audit record before deleting the auth user. The foreign key
  // becomes null after deletion, while the email and completion time remain.
  let deletionRequestId: string | null = null;
  const { data: newDeletionRequest, error: auditError } = await adminClient
    .from('account_deletion_requests')
    .insert({
      user_id: user.id,
      email: user.email ?? '',
      status: 'verified',
      reviewed_at: new Date().toISOString(),
      admin_notes: 'Account deleted automatically after confirmation by the account owner.',
    })
    .select('id')
    .single();

  if (auditError?.code === '23505') {
    // A prior attempt may have created the audit row before an infrastructure
    // error occurred. Reuse it so a confirmed retry can finish deletion.
    const { data: existingDeletionRequest, error: existingRequestError } = await adminClient
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'verified'])
      .maybeSingle();
    if (existingRequestError || !existingDeletionRequest) {
      console.error('Could not recover existing account-deletion audit record:', existingRequestError);
      return Response.json({ error: 'Unable to start account deletion. Please try again.' }, { status: 500, headers: corsHeaders });
    }
    deletionRequestId = existingDeletionRequest.id;
  } else if (auditError || !newDeletionRequest) {
    console.error('Could not create account-deletion audit record:', auditError);
    return Response.json({ error: 'Unable to start account deletion. Please try again.' }, { status: 500, headers: corsHeaders });
  }
  deletionRequestId ??= newDeletionRequest!.id;

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    await adminClient
      .from('account_deletion_requests')
      .update({ status: 'cancelled', admin_notes: `Automatic deletion failed: ${deleteError.message}` })
      .eq('id', deletionRequestId);
    console.error('Could not delete account:', deleteError);
    return Response.json({ error: 'Unable to delete your account. Please try again.' }, { status: 500, headers: corsHeaders });
  }

  await adminClient
    .from('account_deletion_requests')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', deletionRequestId);

  return Response.json({ deleted: true }, { headers: corsHeaders });
});
