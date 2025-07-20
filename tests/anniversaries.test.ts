import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import fs from 'fs/promises';
import axios from 'axios';
import { getTodaysAnniversaries } from '../src/services/anniversaries';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('getTodaysAnniversaries', () => {
  const today = new Date('2023-10-27T12:00:00.000Z'); // JST: 2023-10-27 21:00
  const mockCsvData = `date,title,description
1027,テディベアの日,description1
1027,読書の日,description2
1028,Other Day,description3`;

  beforeEach(async () => {
    await fs.mkdir('./tmp', { recursive: true });
  });

  afterEach(async () => {
    vi.clearAllMocks();
    try {
      await fs.rm('./tmp', { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  it('should fetch, cache, and return today\'s anniversaries', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockCsvData });

    const result = await getTodaysAnniversaries(today);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('テディベアの日');
    expect(result[1].title).toBe('読書の日');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // Check if cache was created
    const cachedContent = await fs.readFile('./tmp/.anniv-20231027.json', 'utf-8');
    const cachedData = JSON.parse(cachedContent);
    expect(cachedData).toBeDefined();
  });

  it('should use cache if available', async () => {
    const cacheContent = JSON.stringify([{ date: '1027', title: 'Cached Anniv', description: 'Cached Desc'}]);
    await fs.writeFile('./tmp/.anniv-20231027.json', cacheContent);

    const result = await getTodaysAnniversaries(today);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Cached Anniv');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should fall back to yesterday\'s cache on fetch error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayCacheContent = JSON.stringify([{ date: '1026', title: 'Yesterday\'s Anniv', description: 'Cached Desc'}]);
    await fs.writeFile('./tmp/.anniv-20231026.json', yesterdayCacheContent);

    const result = await getTodaysAnniversaries(today);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Yesterday\'s Anniv');
    expect(console.error).toHaveBeenCalled();
  });
});