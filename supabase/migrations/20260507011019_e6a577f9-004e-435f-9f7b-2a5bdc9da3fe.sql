
CREATE TABLE public.reminder_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  user_id uuid NOT NULL,
  billing_date date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, billing_date)
);

ALTER TABLE public.reminder_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reminder sends"
  ON public.reminder_sends FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_reminder_sends_sub_date ON public.reminder_sends (subscription_id, billing_date);
