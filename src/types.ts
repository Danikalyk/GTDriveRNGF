export type UserListItem = {
  uid: string;
  user: string;
};

export type RouterListItem = {
  uid: string;
  name: string;
  loading_date: string;
  loading_time: string;
  description: string;
  status: number;
  weight: number;
  volume: number;
  date: new Date("0001-01-01T00:00:00+00:00");
};
