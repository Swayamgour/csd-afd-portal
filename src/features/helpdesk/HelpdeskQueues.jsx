import React from 'react';
import { HelpdeskTickets } from './HelpdeskTickets';

export const HelpdeskMyTickets = () => <HelpdeskTickets filterPreset="my" />;
export const HelpdeskUnassigned = () => <HelpdeskTickets filterPreset="unassigned" />;
export const HelpdeskEscalated = () => <HelpdeskTickets filterPreset="escalated" />;
