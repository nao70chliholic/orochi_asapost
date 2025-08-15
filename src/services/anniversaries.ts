import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

export interface Anniv {
  date: string; // MMDD形式
  title: string;
  description: string;
}

const CACHE_DIR = path.join(process.cwd(), 'tmp');

function getCacheFilePath(date: Date): string {
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return path.join(CACHE_DIR, `.anniv-${yyyymmdd}.json`);
}

async function fetchAndCacheAnniversaries(date: Date): Promise<Anniv[]> {
  logger.info('Fetching anniversaries from external APIs...');
  const mmdd = (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
  let allAnnivs: Anniv[] = [];

  try {
    // 記念日API
    const annivResponse = await axios.get(`https://api.whatistoday.cyou/v3/anniv/${mmdd}`);
    for (let i = 1; i <= 5; i++) {
      const annivTitle = annivResponse.data[`anniv${i}`];
      if (annivTitle) {
        allAnnivs.push({ date: mmdd, title: annivTitle, description: '記念日' });
      }
    }

    // 誕生花API
    const birthflowerResponse = await axios.get(`https://api.whatistoday.cyou/v3/birthflower/${mmdd}`);
    if (birthflowerResponse.data.flower) {
      allAnnivs.push({
        date: mmdd,
        title: `誕生花: ${birthflowerResponse.data.flower}`,
        description: `花言葉: ${birthflowerResponse.data.lang}`,
      });
    }

    // 偉人誕生日API
    const famousBirthdayResponse = await axios.get(`https://api.whatistoday.cyou/v3/famousbirthday/${mmdd}`);
    if (famousBirthdayResponse.data.name) {
      allAnnivs.push({
        date: mmdd,
        title: `誕生日: ${famousBirthdayResponse.data.name}`,
        description: `${famousBirthdayResponse.data.profile} (${famousBirthdayResponse.data.lifespan})`,
      });
    }

    await fs.mkdir(CACHE_DIR, { recursive: true });
    const cachePath = getCacheFilePath(date);
    await fs.writeFile(cachePath, JSON.stringify(allAnnivs, null, 2));
    logger.info(`Cached anniversaries to ${cachePath}`);
    return allAnnivs;
  } catch (error) {
    logger.error(error, 'Failed to fetch or cache anniversaries from external APIs');
    return [];
  }
}

export async function getTodaysAnniversaries(dateJst: Date): Promise<Anniv[]> {
  const cachePath = getCacheFilePath(dateJst);

  try {
    const cachedData = await fs.readFile(cachePath, 'utf-8');
    logger.info('Using cached anniversaries');
    const parsedData: Anniv[] = JSON.parse(cachedData);
    const todayMMDD = (dateJst.getMonth() + 1).toString().padStart(2, '0') + dateJst.getDate().toString().padStart(2, '0');
    const filteredCachedData = parsedData.filter(anniv => anniv.date === todayMMDD);
    if (filteredCachedData.length > 0) {
      return filteredCachedData.sort((a, b) => a.title.localeCompare(b.title)).slice(0, 10);
    }
  } catch (error) {
    logger.warn('Cache miss or read error, fetching new data.', error);
  }

  const allAnnivs = await fetchAndCacheAnniversaries(dateJst);
  if (allAnnivs.length === 0) {
    try {
      const yesterday = new Date(dateJst);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayCachePath = getCacheFilePath(yesterday);
      const cachedData = await fs.readFile(yesterdayCachePath, 'utf-8');
      logger.warn('Falling back to yesterday\'s cache');
      const parsedData: Anniv[] = JSON.parse(cachedData);
      const todayMMDD = (dateJst.getMonth() + 1).toString().padStart(2, '0') + dateJst.getDate().toString().padStart(2, '0');
      return parsedData.filter(anniv => anniv.date === todayMMDD).sort((a, b) => a.title.localeCompare(b.title)).slice(0, 10);
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