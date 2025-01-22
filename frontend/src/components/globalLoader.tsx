"use client";

import React from 'react';

export const GlobalLoader: React.FC = () => (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] backdrop-blur-[2px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);