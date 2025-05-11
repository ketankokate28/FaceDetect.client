export interface NotificationAlert {
  notification_id?: number;
  channel: 'email' | 'sms' | 'call' | 'push';
  cctv_id?: number;
  match_id?: number;
  payload: string;
  recipient: string;
  created_at?: string;
  last_attempt_at?: string;
  attempt_count?: number;
  status: 'pending' | 'sent' | 'failed';
  last_error?: string;
}
