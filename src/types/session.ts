export type SessionType = 'livestream' | 'video' | 'event';
export type TimeSlot = 'sáng' | 'chiều' | 'tối';

export interface WorkSession {
  id: string;
  date: string;
  timeSlot: TimeSlot;
  staffNames: string[];
  productCategory: string;
  sessionType: SessionType;
  notes?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  avatar?: string;
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  livestream: 'Livestream',
  video: 'Quay video',
  event: 'Sự kiện',
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  'sáng': 'Sáng',
  'chiều': 'Chiều',
  'tối': 'Tối',
};

export const PRODUCT_CATEGORIES = [
  'Nước hoa',
  'Quần áo',
  'Rong biển',
  'Mỹ phẩm',
  'Phụ kiện',
  'Thực phẩm',
  'Khác',
];

export const DEFAULT_STAFF: Staff[] = [
  { id: '1', name: 'An' },
  { id: '2', name: 'Chi' },
  { id: '3', name: 'Kỳ' },
  { id: '4', name: 'Ngân Hà' },
  { id: '5', name: 'Trà My' },
];
