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

const albums = await axios.get(`${BASE_URL}/api/albums`).then(res => res.data.data);
const songs = await axios.get(`${BASE_URL}/api/songs`).then(res => res.data.data.list);
for (const song of songs) {
  const detail = await axios.get(`${BASE_URL}/api/song/${song.cid}`).then(res => res.data.data);
  const album = albums.find(entry => entry.cid === detail.albumCid);
  feed.item({
    guid: song.cid,
    title: song.name,
    description: `Artists: ${detail.artists.join(', ')}
${album ? `Album: ${album.name}\n` : ''}`,
    sourceUrl: detail.sourceUrl ?? '',
    lyricUrl: detail.lyricUrl ?? '',
    mvUrl: detail.mvUrl ?? '',
    mvCoverUrl: detail.mvCoverUrl ?? '',
    artists: detail.artists.join(', '),
    webUrl: `${BASE_URL}/music/${detail.cid}`,
    albumName: album ? album.name : '',
    albumCid: album ? album.cid : '',
    albumCoverUrl: album ? album.coverUrl : '',
    albumArtists: album ? album.artistes.join(', ') : '',
  });
}

export const handler = () => ({
  statusCode: 200,
  body: feed.xml(),
});
