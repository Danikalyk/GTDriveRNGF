export type UserListItem = {
  uid: string;
  user: string;
};

export interface RouterListItem {
  uid: string;
  name: string;
  loading_date?: string;
  loading_time?: string;
  date: string;
  description?: string;
  status: number;
  start: boolean;
  startGeo: {
    uidPoint: string;
    lat: string | number;
    lon: string | number;
  };
  followingPoints: any[];
  descriptions: {
    [key: string]: string;
  };
  firstInQueue?: boolean | string;
}
