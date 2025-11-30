import { WorkSession } from '@/types/session';
import { Video, Radio, Calendar, Users } from 'lucide-react';

interface StatsCardsProps {
  sessions: WorkSession[];
}

export function StatsCards({ sessions }: StatsCardsProps) {
  const totalSessions = sessions.length;
  const livestreamCount = sessions.filter(s => s.sessionType === 'livestream').length;
  const videoCount = sessions.filter(s => s.sessionType === 'video').length;
  const uniqueStaff = new Set(sessions.flatMap(s => s.staffNames)).size;

  const stats = [
    { 
      label: 'Tổng phiên', 
      value: totalSessions, 
      icon: Calendar,
      color: 'bg-primary/10 text-primary' 
    },
    { 
      label: 'Livestream', 
      value: livestreamCount, 
      icon: Radio,
      color: 'bg-red-500/10 text-red-500' 
    },
    { 
      label: 'Quay video', 
      value: videoCount, 
      icon: Video,
      color: 'bg-blue-500/10 text-blue-500' 
    },
    { 
      label: 'Nhân viên', 
      value: uniqueStaff, 
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-500' 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div 
          key={stat.label}
          className="bg-card rounded-xl p-4 shadow-soft border border-border/50 animate-slide-up"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
