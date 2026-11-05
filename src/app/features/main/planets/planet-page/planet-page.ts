import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Loader } from '@shared/components/ui';
import { PlanetDetailsService } from '../services/planet-details.service';

@Component({
  selector: 'app-planet-page',
  imports: [Loader, RouterLink],
  templateUrl: './planet-page.html',
  styleUrl: './planet-page.css',
})
export class PlanetPage {
  private activatedRoute = inject(ActivatedRoute);
  public planetDetailsService = inject(PlanetDetailsService);

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      const planetId = params['id'];
      this.planetDetailsService.getPlanetById(planetId);
    })
  }

  formatNumber(value: string, unit = ''): string {
    const number = Number(value);

    if (!value || Number.isNaN(number)) {
      return 'Нет данных';
    }

    return `${number.toLocaleString('ru-RU')}${unit ? ` ${unit}` : ''}`;
  }

}
