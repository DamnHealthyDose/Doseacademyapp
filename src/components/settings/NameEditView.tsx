import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryPath } from './settingsConfig';

const NameEditView = () => {
  const navigate = useNavigate();
  const { user, loading, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  useEffect(() => { setName(profile?.display_name ?? ''); }, [profile?.display_name]);

  // Signed out: there is no name to edit, so go back to Account & Profile.
  useEffect(() => {
    if (!loading && !user) navigate(categoryPath('account'), { replace: true });
  }, [loading, user, navigate]);

  const trimmed = name.trim();
  const changed = trimmed.length > 0 && trimmed !== (profile?.display_name ?? '');

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !trimmed) return;
    setSaving(true);
    // .select() returns the updated rows: RLS blocking the update gives no error, just 0 rows.
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: trimmed })
      .eq('user_id', user.id)
      .select('id');
    setSaving(false);
    if (error || !data || data.length === 0) {
      toast.error("Couldn't save your name. Try again.");
      return;
    }
    await refreshProfile();
    toast.success('Name saved');
    // replace: the browser Back button shouldn't reopen the edit view.
    navigate(categoryPath('account'), { replace: true });
  };

  if (!user) return null;

  return (
    <section aria-labelledby="name-heading">
      <h2 id="name-heading" className="text-foreground font-heading font-extrabold text-xl mb-4">Display name</h2>
      <form onSubmit={save} className="rounded-card border border-border bg-bg-card p-5 flex flex-col gap-3">
        <Label htmlFor="display-name" className="text-foreground font-heading font-bold text-sm">What should we call you?</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id="display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
            className="flex-1 basis-48"
          />
          <Button type="submit" disabled={!changed || saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </section>
  );
};

export default NameEditView;
