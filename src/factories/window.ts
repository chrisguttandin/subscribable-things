import { TWindow, TWindowFactory } from '../types';

// @todo TypeScript does not include type definitions for the Reporting API yet.
export const createWindow: TWindowFactory = () => (typeof window === 'undefined' ? null : <TWindow>window);
