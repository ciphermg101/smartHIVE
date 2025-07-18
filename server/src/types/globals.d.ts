/// <reference types="@clerk/express/env" />

export {};
declare global {
  interface PublicMetadata {
    role?: string;
    [key: string]: any;
  }
  interface CustomSessionClaims {
    publicMetadata?: PublicMetadata;
    [key: string]: any;
  }
}