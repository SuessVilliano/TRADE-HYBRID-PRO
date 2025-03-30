
import React, { useEffect, useState } from 'react';
import { whopService } from '@/lib/services/whop-service';
import { Alert } from './alert';

export function WhopStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkWhopConnection();
  }, []);

  const checkWhopConnection = async () => {
    try {
      const isValid = await whopService['validateApiKey']();
      setStatus(isValid ? 'connected' : 'error');
      if (!isValid) {
        setErrorMessage('Failed to validate Whop API connection');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error connecting to Whop services');
    }
  };

  if (status === 'checking') {
    return <div>Checking Whop connection...</div>;
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <h3>Whop Connection Error</h3>
        <p>{errorMessage}</p>
      </Alert>
    );
  }

  return (
    <Alert variant="success">
      <h3>Whop Connected</h3>
      <p>Successfully connected to Whop services</p>
    </Alert>
  );
}
