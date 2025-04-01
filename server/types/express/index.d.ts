import express from 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      isAdmin: boolean;
      role: string;
      membership: string;
      [key: string]: any;
    }
    
    interface Request {
      user?: User;
    }
  }
}

export {};