import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'connected':
    case 'running':
    case 'success':
    case 'posted':
      return 'text-emerald-400';
    case 'pending':
    case 'scheduled':
    case 'draft':
      return 'text-cyan-400';
    case 'failed':
    case 'error':
    case 'disconnected':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function getStatusBg(status: string): string {
  switch (status.toLowerCase()) {
    case 'connected':
    case 'running':
    case 'success':
    case 'posted':
      return 'bg-emerald-400/10 border-emerald-400/20';
    case 'pending':
    case 'scheduled':
    case 'draft':
      return 'bg-cyan-400/10 border-cyan-400/20';
    case 'failed':
    case 'error':
    case 'disconnected':
      return 'bg-red-400/10 border-red-400/20';
    default:
      return 'bg-gray-400/10 border-gray-400/20';
  }
}

export function getPlatformIcon(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return '𝕏';
    case 'telegram':
      return '✈️';
    case 'instagram':
      return '📸';
    case 'facebook':
      return '👤';
    case 'xiaohongshu':
    case 'red':
      return '📕';
    case 'wechat':
      return '💬';
    case 'douyin':
      return '🎵';
    default:
      return '📱';
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return 'text-blue-400';
    case 'telegram':
      return 'text-sky-400';
    case 'instagram':
      return 'text-pink-400';
    case 'facebook':
      return 'text-blue-500';
    case 'xiaohongshu':
    case 'red':
      return 'text-red-400';
    case 'wechat':
      return 'text-green-400';
    case 'douyin':
      return 'text-violet-400';
    default:
      return 'text-gray-400';
  }
}
