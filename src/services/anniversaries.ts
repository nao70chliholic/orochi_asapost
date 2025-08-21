'''import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

export interface Anniv {
  title: string;
  description: string;
}

const CSV_URL = 'https://raw.githubusercontent.com/ikedam/japan-anniversaries/master/anniversaries.csv';
const CACHE_DIR = path.join(process.cwd(), 'tmp');

function getCacheFilePath(date: Date): string {
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return path.join(CACHE_DIR, `.anniv-${yyyymmdd}.json`);
}

async function fetchAndCacheAnniversaries(date: Date): Promise<Anniv[]> {
  logger.info('Fetching anniversaries from remote...');
  try {
    const response = await axios.get<string>(CSV_URL);
    const lines = response.data.split('
').slice(1); // Skip header
    const allAnnivs = lines.map(line => {
      const [dateStr, title, description] = line.split(',');
      return { date: dateStr, title, description };
    });

    await fs.mkdir(CACHE_DIR, { recursive: true });
    const cachePath = getCacheFilePath(date);
    await fs.writeFile(cachePath, JSON.stringify(allAnnivs, null, 2));
    logger.info(`Cached anniversaries to ${cachePath}`);
    return allAnnivs;
  } catch (error) {
    logger.error(error, 'Failed to fetch or cache anniversaries');
    return [];
  }
}

export async function getTodaysAnniversaries(dateJst: Date): Promise<Anniv[]> {
  const cachePath = getCacheFilePath(dateJst);

  try {
    const cachedData = await fs.readFile(cachePath, 'utf-8');
    logger.info('Using cached anniversaries');
    return JSON.parse(cachedData);
  } catch (error) {
    // Cache miss or read error, fetch new data
  }

  const allAnnivs = await fetchAndCacheAnniversaries(dateJst);
  if (allAnnivs.length === 0) {
    // Fetch failed, try to use yesterday's cache
    try {
      const yesterday = new Date(dateJst);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayCachePath = getCacheFilePath(yesterday);
      const cachedData = await fs.readFile(yesterdayCachePath, 'utf-8');
      logger.warn('Falling back to yesterday's cache');
      return JSON.parse(cachedData);
    } catch (fallbackError) {
      logger.error(fallbackError, 'Failed to read fallback cache');
      return [];
    }
  }


  const todayMMDD = (dateJst.getMonth() + 1).toString().padStart(2, '0') + dateJst.getDate().toString().padStart(2, '0');

  return allAnnivs
    .filter(anniv => anniv.date === todayMMDD)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 10);
}
''