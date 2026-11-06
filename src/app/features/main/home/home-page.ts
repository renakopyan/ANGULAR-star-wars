import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { API_CORE } from '@shared/consts';
import { EpisodesService } from '@features/main/episodes/services/episodes.service';
import { CharactersService } from '@features/main/characters/services/characters.service';

type HomeSection = {
  path: string;
  title: string;
  caption: string;
  image: string;
  count: number | null;
};

const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
const DAY_MS = 86_400_000;

type TotalResponse = { total_records: number };
type FilmsResponse = { result: unknown[] };

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private http = inject(HttpClient);
  private episodesService = inject(EpisodesService);
  private charactersService = inject(CharactersService);
  private characterOffset = signal(0);

  public timeline = computed(() =>
    [...this.episodesService.filmsList()].sort((a, b) => Number(a.episodeId) - Number(b.episodeId)),
  );

  public characterOfDay = computed(() => {
    return null;

    const characters = this.charactersService.charactersList();

    if (!characters.length) {
      return null;
    }

    const day = Math.floor(Date.now() / DAY_MS);
    return characters[(day + this.characterOffset()) % characters.length];
  });

  public sections = signal<HomeSection[]>([
    { path: '/characters', title: 'Персонажи', caption: 'Джедаи, ситхи, дроиды и контрабандисты', image: '/assets/characters/dart-vader.webp', count: null },
    { path: '/episodes', title: 'Фильмы', caption: 'Шесть эпизодов великой саги', image: '/assets/films/episode-4.webp', count: null },
    { path: '/planets', title: 'Планеты', caption: 'Миры от пустынь до ледяных пустошей', image: '/assets/planets/tatooine-2.webp', count: null },
  ]);

  constructor() {
    this.episodesService.getAll();
    this.charactersService.getAll();

    forkJoin({
      characters: this.http.get<TotalResponse>(`${API_CORE}/people`, { params: { page: 1, limit: 1 } }),
      films: this.http.get<FilmsResponse>(`${API_CORE}/films`),
      planets: this.http.get<TotalResponse>(`${API_CORE}/planets`, { params: { page: 1, limit: 1 } }),
    }).subscribe({
      next: ({ characters, films, planets }) => {
        const counts: Record<string, number> = {
          '/characters': characters.total_records,
          '/episodes': films.result.length,
          '/planets': planets.total_records,
        };
        this.sections.update((sections) =>
          sections.map((section) => ({ ...section, count: counts[section.path] ?? null })),
        );
      },
    });
  }

  showNextCharacter() {
    this.characterOffset.update((offset) => offset + 1);
  }

  toRoman(episodeId: string): string {
    return ROMAN_NUMERALS[Number(episodeId)] ?? episodeId;
  }
}
