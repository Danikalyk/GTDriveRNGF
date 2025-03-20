export type UserListItem = {
  uid: string;
  user: string;
};

export interface RouterListItem {
  uid: string;
  name: string;
  loading_date?: string;
  loading_time?: string;
  description?: string;
  status: number;
  start: boolean;
  startGeo: {
    lat: number;
    lon: number;
    status: number;
    address: string;
    client_name: string;
    orders: any[];
    time: string;
    date: string;
    time_fact?: string;
    date_fact?: string;
  };
  followingPoints: Array<{
    lat: number;
    lon: number;
    status: number;
    address: string;
    client_name: string;
    orders: any[];
    time: string;
    date: string;
    time_fact?: string;
    date_fact?: string;
  }>;
  descriptions: Record<string, string>;
  date: string;
  firstInQueue?: boolean | string;
  points?: Array<{
    lat: number;
    lon: number;
    status: number;
    address: string;
    client_name: string;
    orders: any[];
    time: string;
    date: string;
    time_fact?: string;
    date_fact?: string;
  }>;
}
