"use client";

import { Customer } from './types';

const CUSTOMERS_KEY = 'contract_generator_customers';

export const customerStorage = {
  getAll: (): Customer[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Customer | undefined => {
    const customers = customerStorage.getAll();
    return customers.find(c => c.id === id);
  },

  save: (customer: Customer): void => {
    const customers = customerStorage.getAll();
    const index = customers.findIndex(c => c.id === customer.id);
    
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  delete: (id: string): void => {
    const customers = customerStorage.getAll();
    const filtered = customers.filter(c => c.id !== id);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
  }
};