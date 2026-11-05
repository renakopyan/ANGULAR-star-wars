import { Component } from '@angular/core';

type HyperspaceStreak = {
  angle: number;
  delay: number;
  accent: boolean;
};

const STREAKS_COUNT = 32;

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader {
  public streaks: HyperspaceStreak[] = Array.from({ length: STREAKS_COUNT }, (_, i) => ({
    angle: (360 / STREAKS_COUNT) * i + Math.random() * 8,
    delay: Math.random() * 1.2,
    accent: i % 5 === 0,
  }));
}
