import { afterRenderEffect, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services';
import { ContextMenu, ContextMenuOption } from '@shared/components/ui';

type NavRoute = {
  path: string;
  name: string;
  sections?: string[];
};

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, ContextMenu],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  private router = inject(Router);
  private authService = inject(AuthService);
  public isContextMenuVisible = signal(false);
  public routes: NavRoute[] = [
    { path: '/characters', name: 'Персонажи' },
    { path: '/episodes', name: 'Фильмы' },
    { path: '/planets', name: 'Планеты' },
    { path: '/species', name: 'Биологический вид' },
    { path: '/starships', name: 'Звездные корабли' },
    // { path: '/vehicles', name: 'Транспортные средства' },
  ];

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private section = computed(() => this.currentUrl().split(/[/?#]/)[1] ?? '');
  public isHomeActive = computed(() => this.section() === '');
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRenderEffect(() => {
      this.section();
      this.host.nativeElement
        .querySelector('.navigation__link--active')
        ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  }

  get contextMenuOptions(): ContextMenuOption[] {
    if (!this.authService.isAuthed) {
      return [
        { id: 'sign-in', label: 'Войти', variant: 'accent', icon: '/svg/sign-in.svg' },
        { id: 'favorites', label: 'Избранное', variant: 'default', icon: '/svg/favorites.svg' },
        { id: 'settings', label: 'Настройки', variant: 'default', icon: '/svg/settings.svg' },
      ];
    }

    return [
      { id: 'profile', label: 'Профиль', variant: 'default', icon: '/svg/profile.svg' },
      { id: 'favorites', label: 'Избранное', variant: 'default', icon: '/svg/favorites.svg' },
      { id: 'settings', label: 'Настройки', variant: 'default', icon: '/svg/settings.svg' },
      { id: 'logout', label: 'Выйти', variant: 'danger', icon: '/svg/logout.svg' },
    ];
  }

  isRouteActive({ path, sections = [] }: NavRoute): boolean {
    return [path.slice(1), ...sections].includes(this.section());
  }

  handleProfileClick() {
    this.isContextMenuVisible.update((isVisible) => !isVisible);
  }

  handleProfileMenuSelect(option: ContextMenuOption) {
    if (option.id === 'sign-in') {
      this.router.navigate(['/sign-in']);
    }

    if (option.id === 'profile') {
      this.router.navigate(['/account/profile']);
    }

    if (option.id === 'favorites') {
      this.router.navigate(['/account/favorites']);
    }

    if (option.id === 'settings') {
      this.router.navigate(['/account/settings/appearance']);
    }

    if (option.id === 'logout') {
      this.authService.logout();
    }

    this.isContextMenuVisible.set(false);
  }
}
