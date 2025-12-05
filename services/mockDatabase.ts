import { Client, ClientStatus } from "../types";

// Simulating database latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    status: ClientStatus.ACTIVE,
    program: 'Terminator Prep',
    joinDate: '2023-10-15',
    lastCheckIn: '2 days ago',
    progress: 75,
  },
  {
    id: '2',
    name: 'John Rambo',
    email: 'john@example.com',
    status: ClientStatus.LEAD,
    program: 'Survival 101',
    joinDate: '2023-11-01',
    lastCheckIn: 'N/A',
    progress: 10,
  },
  {
    id: '3',
    name: 'Ellen Ripley',
    email: 'ellen@weyland.com',
    status: ClientStatus.ACTIVE,
    program: 'Alien Evasion Cardio',
    joinDate: '2023-09-20',
    lastCheckIn: '1 day ago',
    progress: 92,
  },
  {
    id: '4',
    name: 'Tony Stark',
    email: 'tony@stark.com',
    status: ClientStatus.CHURNED,
    program: 'Heavy Metal Lifting',
    joinDate: '2023-01-10',
    lastCheckIn: '3 months ago',
    progress: 100,
  }
];

export const fetchClients = async (): Promise<Client[]> => {
  await delay(600);
  return [...MOCK_CLIENTS];
};

export const fetchRevenueData = async (): Promise<any[]> => {
  await delay(400);
  return [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];
};