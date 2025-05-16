// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationEndpoint {
  private demoNotifications = [
    {
      id: 1,
      header: 'Suspect Prakash is found in CCTV1 near Palghar sec 5 on 5/28/2017 4:54:13 PM',
      body: 'Prakash Bhalerao 1 is found in CCTV1 near Palghar sec 5 on 5/28/2017 4:54:13 PM',
      isRead: true,
      isPinned: true,
      date: '2017-05-28T16:29:13.5877958'
    },
    {
      id: 2,
      header: 'Suspect 2 is found in CCTV5 near Palghar sec 3 on 5/28/2017 4:54:13 PM',
      body: 'Suspect 2 is found in CCTV5 near Palghar sec 3 on 5/28/2017 4:54:13 PM',
      isRead: false,
      isPinned: false,
      date: '2017-05-28T19:54:42.4144502'
    },
    {
      id: 3,
      header: 'Tomorrow is half day',
      body: 'Guys, tomorrow we close by midday. Please check all your notifications. Thanks.',
      isRead: false,
      isPinned: false,
      date: '2017-05-30T11:13:42.4144502'
    }
  ];


  getNotificationEndpoint<T>(notificationId: number) {
    const notification = this.demoNotifications.find(val => val.id === notificationId);
    return this.createDemoResponse(notification as T, notification ? null : 404);
  }

  getNotificationsEndpoint<T>(page: number, pageSize: number) {
    return this.createDemoResponse(this.demoNotifications as T, null, page, pageSize);
  }

  getUnreadNotificationsEndpoint<T>(userId?: string) {
    const unreadNotifications = this.demoNotifications.filter(val => !val.isRead);
    return this.createDemoResponse(unreadNotifications as T, null, userId);
  }

  getNewNotificationsEndpoint<T>(lastNotificationDate?: Date) {
    return this.createDemoResponse(this.demoNotifications as T, null, lastNotificationDate);
  }

  getPinUnpinNotificationEndpoint(notificationId: number, isPinned?: boolean) {
    const notification = this.demoNotifications.find(val => val.id === notificationId);

    if (notification) {
      if (isPinned == null) {
        isPinned = !notification.isPinned;
      }

      notification.isPinned = isPinned;
      notification.isRead = true;

      return this.createDemoResponse(null);
    } else {
      return this.createDemoResponse(null, 404);
    }
  }

  getReadUnreadNotificationEndpoint(notificationIds: number[], isRead: boolean) {
    for (const notificationId of notificationIds) {
      const notification = this.demoNotifications.find(val => val.id === notificationId);

      if (notification)
        notification.isRead = isRead;
    }

    return this.createDemoResponse(null);
  }

  getDeleteNotificationEndpoint<T>(notificationId: number) {
    const notification = this.demoNotifications.find(val => val.id === notificationId);

    if (notification)
      this.demoNotifications = this.demoNotifications.filter(val => val.id !== notificationId);

    return this.createDemoResponse(notification as T, notification ? null : 404);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createDemoResponse<T>(data: T, errorCode: number | null = null, ...args: unknown[]): Observable<T> {
    if (errorCode == null)
      return of(data);
    else
      return throwError(() => new HttpErrorResponse({ status: errorCode, error: 'Demo. An error occurred' }));
  }
}
