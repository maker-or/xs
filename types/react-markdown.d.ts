import React from 'react';
declare module 'react-markdown' {
  interface Components {
    'grammar-block': React.ComponentType<{ node?: unknown; children: React.ReactNode }>;
  }
}
