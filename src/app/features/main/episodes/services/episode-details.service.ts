import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { EpisodesServerResponse } from './episodes-server-types';
import { episodesResponseMapping } from './episodes-api-mapping';
import { EpisodesDict, EpisodeType } from '@shared/domain';
import { API_CORE } from '@shared/consts';

@Injectable({
  providedIn: 'root'
})
export class EpisodeDetailsService {
  private http = inject(HttpClient);
  public error = signal('');
  public isEpisodeLoading = signal(false);
  public selectedEpisode = signal<EpisodeType|null>(null);
  public cachedEpisodes = signal<EpisodesDict>({});

  getEpisodeById(id: string) {
    this.error.set('');

    if(this.cachedEpisodes()[id]) {
      this.selectedEpisode.set(this.cachedEpisodes()[id]);
      return;
    }

    this.isEpisodeLoading.set(true);

    this.http.get<EpisodesServerResponse>(`${API_CORE}/films`, { params: { expanded: true } })
      .pipe(finalize(() => this.isEpisodeLoading.set(false)))
      .subscribe({
        next: (response) => {
          const mappedResponse = episodesResponseMapping(response);
          this.cachedEpisodes.set(mappedResponse);
          this.selectedEpisode.set(mappedResponse[id]);
        },
        error: () => {
          this.error.set(`Ошибка при загрузке эпизода ${id}`)
        }
      })
  }
}
