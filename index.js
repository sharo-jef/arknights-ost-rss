import { writeFile } from 'fs/promises';

import axios from 'axios';
import RSS from 'rss';

const BASE_URL = 'https://monster-siren.hypergryph.com';

const feed = new RSS({
  title: 'Arknights OST',
  site_url: 'https://monster-siren.hypergryph.com/',
  description: `Monster Siren Records (MSR), one of the world's largest music publishers in the eleventh century in Terra.
  From heavy metal bands to the idol industry, MSR artists are involved in all aspects of music.
  According to the latest statistics, MSR occupies more than 30% of the music market in Terra.`,
  language: 'zh-cn',
});

console.log('Fetching: albums');
const albums = await axios.get(`${BASE_URL}/api/albums`).then(res => res.data.data);
console.log(`Fetched: ${albums.length} albums`);
console.log('Fetching: songs');
const songs = await axios.get(`${BASE_URL}/api/songs`).then(res => res.data.data.list);
console.log(`Fetched: ${songs.length} songs`);
for (const song of songs) {
  console.log(`Fetching: ${song.name}`);
  const detail = await axios.get(`${BASE_URL}/api/song/${song.cid}`).then(res => res.data.data);
  const album = albums.find(entry => entry.cid === detail.albumCid);
  feed.item({
    guid: song.cid,
    title: song.name,
    description: `Artists: ${detail.artists.join(', ')}<br />
${album ? `Album: ${album.name}<br />` : ''}`,
    url: `${BASE_URL}/music/${detail.cid}`,
    author: detail.artists.join(', '),
    custom_elements: [
      { sourceUrl: detail.sourceUrl ?? '' },
      { lyricUrl: detail.lyricUrl ?? '' },
      { mvUrl: detail.mvUrl ?? '' },
      { mvCoverUrl: detail.mvCoverUrl ?? '' },
      { artists: detail.artists.join(', ') },
      { webUrl: `${BASE_URL}/music/${detail.cid}` },
      { albumName: album ? album.name : '' },
      { albumCid: album ? album.cid : '' },
      { albumCoverUrl: album ? album.coverUrl : '' },
      { albumArtists: album ? album.artistes.join(', ') : '' },
    ],
  });
}
console.log('Done!');

await writeFile('./_site/rss.xml', feed.xml({ indent: true }));
console.log('Wrote to: ./_site/rss.xml');
