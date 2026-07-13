interface PostingSchedule {
  platform: string;
  times: string[];
  timezone: string;
  weekendOffset: number; // hours to shift on weekends
}

const OPTIMAL_SCHEDULES: Record<string, PostingSchedule> = {
  twitter: {
    platform: 'twitter',
    times: ['08:00', '12:00', '18:00'],
    timezone: 'America/New_York',
    weekendOffset: 2
  },
  instagram: {
    platform: 'instagram',
    times: ['07:00', '11:00', '19:00'],
    timezone: 'America/New_York',
    weekendOffset: 2
  },
  xiaohongshu: {
    platform: 'xiaohongshu',
    times: ['09:00', '13:00', '20:00'],
    timezone: 'Asia/Shanghai',
    weekendOffset: 1
  },
  telegram: {
    platform: 'telegram',
    times: ['09:00', '15:00', '21:00'],
    timezone: 'UTC',
    weekendOffset: 0
  },
  facebook: {
    platform: 'facebook',
    times: ['09:00', '13:00', '17:00'],
    timezone: 'America/New_York',
    weekendOffset: 2
  },
  wechat: {
    platform: 'wechat',
    times: ['08:00', '12:00', '18:00'],
    timezone: 'Asia/Shanghai',
    weekendOffset: 1
  },
  douyin: {
    platform: 'douyin',
    times: ['10:00', '14:00', '21:00'],
    timezone: 'Asia/Shanghai',
    weekendOffset: 1
  },
  linkedin: {
    platform: 'linkedin',
    times: ['08:00', '12:00', '17:00'],
    timezone: 'America/New_York',
    weekendOffset: 3 // LinkedIn has less weekend activity
  }
};

export function getOptimalTimes(platform: string): string[] {
  const schedule = OPTIMAL_SCHEDULES[platform.toLowerCase()];
  
  if (!schedule) {
    // Default times
    return ['09:00', '13:00', '18:00'];
  }
  
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  if (isWeekend && schedule.weekendOffset > 0) {
    // Shift times for weekends
    return schedule.times.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const shiftedHours = (hours + schedule.weekendOffset) % 24;
      return `${shiftedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });
  }
  
  return schedule.times;
}

export function getRandomizedTime(time: string, varianceMinutes: number = 30): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  
  // Set base time
  date.setHours(hours, minutes, 0, 0);
  
  // Add random variance (-30 to +30 minutes)
  const variance = Math.floor(Math.random() * varianceMinutes * 2) - varianceMinutes;
  date.setMinutes(date.getMinutes() + variance);
  
  // If time has passed today, schedule for tomorrow
  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
}

export function getNextPostingTime(platform: string): Date {
  const times = getOptimalTimes(platform);
  const now = new Date();
  
  for (const time of times) {
    const scheduledTime = getRandomizedTime(time);
    
    if (scheduledTime > now) {
      return scheduledTime;
    }
  }
  
  // If all times have passed, use first time tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getRandomizedTime(times[0]);
}

export function calculateDailyPostTimes(platform: string, count: number): Date[] {
  const times = getOptimalTimes(platform);
  const posts: Date[] = [];
  
  for (let i = 0; i < count; i++) {
    const timeIndex = i % times.length;
    posts.push(getRandomizedTime(times[timeIndex]));
  }
  
  return posts.sort((a, b) => a.getTime() - b.getTime());
}

export function isOptimalPostingTime(platform: string): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
  
  const times = getOptimalTimes(platform);
  
  // Check if current time is within 30 minutes of an optimal time
  for (const time of times) {
    const [optHour, optMin] = time.split(':').map(Number);
    const optTotalMinutes = optHour * 60 + optMin;
    const currentTotalMinutes = currentHour * 60 + currentMinutes;
    
    if (Math.abs(optTotalMinutes - currentTotalMinutes) <= 30) {
      return true;
    }
  }
  
  return false;
}

export function getScheduleForPlatform(platform: string): PostingSchedule | null {
  return OPTIMAL_SCHEDULES[platform.toLowerCase()] || null;
}

export function getAllSchedules(): Record<string, PostingSchedule> {
  return OPTIMAL_SCHEDULES;
}

export function adjustScheduleForTimezone(times: string[], fromTz: string, toTz: string): string[] {
  // Simple timezone offset calculation
  // In production, use a proper timezone library
  const offsets: Record<string, number> = {
    'America/New_York': -5,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
    'Asia/Shanghai': 8,
    'Asia/Tokyo': 9,
    'UTC': 0
  };
  
  const fromOffset = offsets[fromTz] || 0;
  const toOffset = offsets[toTz] || 0;
  const diff = toOffset - fromOffset;
  
  return times.map(time => {
    const [hours, minutes] = time.split(':').map(Number);
    const adjustedHours = ((hours + diff) % 24 + 24) % 24;
    return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });
}
