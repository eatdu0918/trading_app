'use client';

import { useEffect, useRef } from 'react';
import { useAlertStore } from '@/store/alerts';

export function usePriceAlerts(symbolId: string, currentPrice: number | null) {
  const { alerts, markTriggered } = useAlertStore();
  const lastPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentPrice === null) return;

    const prev = lastPriceRef.current;
    lastPriceRef.current = currentPrice;

    if (prev === null) return;

    const activeAlerts = alerts.filter((a) => a.symbolId === symbolId && !a.triggered);

    for (const alert of activeAlerts) {
      const crossed =
        (alert.direction === 'above' &&
          prev < alert.targetPrice &&
          currentPrice >= alert.targetPrice) ||
        (alert.direction === 'below' &&
          prev > alert.targetPrice &&
          currentPrice <= alert.targetPrice);

      if (crossed) {
        markTriggered(alert.id);
        fireNotification(alert.symbolBase, alert.targetPrice, alert.direction, currentPrice);
      }
    }
  }, [currentPrice, symbolId, alerts, markTriggered]);
}

function fireNotification(base: string, target: number, dir: AlertDirection, actual: number) {
  const body = `${base} 가격이 ${dir === 'above' ? '▲' : '▼'} $${target.toLocaleString()} ${dir === 'above' ? '돌파' : '하향'}했습니다. 현재가: $${actual.toLocaleString()}`;

  if (typeof Notification === 'undefined') return;

  if (Notification.permission === 'granted') {
    new Notification(`${base} 가격 알림`, { body, icon: '/icons/icon-192.png' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification(`${base} 가격 알림`, { body, icon: '/icons/icon-192.png' });
      }
    });
  }
}

type AlertDirection = 'above' | 'below';
