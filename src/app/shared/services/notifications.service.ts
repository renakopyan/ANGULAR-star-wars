import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public isVisible = signal(false);
  public message = signal('');
  private hideTimer?: ReturnType<typeof setTimeout>;

  closeNotification() {
    clearTimeout(this.hideTimer);
    this.isVisible.set(false);
    this.message.set('')
  }

  invokeNotification(message: string) {
    this.message.set(message);
    this.isVisible.set(true);

    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.closeNotification(), 5000);
  }
}