export interface CartUpdatedEvent {
  email: string;
  cart_status: 'active' | 'abandoned' | 'purchased';
  cart_value: number;
  product_name: string;
  timestamp: string;
}

export interface SystemStatus {
  maKeyActive: boolean;
  apiKeyActive: boolean;
  webhookConnected: boolean;
}

export interface WebhookTelemetry {
  sent: number;
  delivered: number;
  opened: number;
}
