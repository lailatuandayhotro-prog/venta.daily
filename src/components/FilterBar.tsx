import { useState } from 'react';
import { DEFAULT_STAFF, SESSION_TYPE_LABELS, SessionType } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  staff: string;
  sessionType: string;
  dateFrom: string;
  dateTo: string;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    staff: 'all',
    sessionType: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      search: '',
      staff: 'all',
      sessionType: 'all',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.search || filters.staff !== 'all' || filters.sessionType !== 'all' || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>
        
        <Select value={filters.staff} onValueChange={(v) => updateFilter('staff', v)}>
          <SelectTrigger className="w-[140px] bg-muted/50">
            <SelectValue placeholder="Nhân viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {DEFAULT_STAFF.map((staff) => (
              <SelectItem key={staff.id} value={staff.name}>{staff.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sessionType} onValueChange={(v) => updateFilter('sessionType', v)}>
          <SelectTrigger className="w-[140px] bg-muted/50">
            <SelectValue placeholder="Loại phiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateFilter('dateFrom', e.target.value)}
          className="w-[150px] bg-muted/50"
          placeholder="Từ ngày"
        />

        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateFilter('dateTo', e.target.value)}
          className="w-[150px] bg-muted/50"
          placeholder="Đến ngày"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
