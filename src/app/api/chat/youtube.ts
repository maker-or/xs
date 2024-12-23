//import { google, youtube_v3 } from 'googleapis';

// // Define an interface for the video result
// interface YouTubeVideo {
//   title: string;
//   thumbnailUrl: string;
//   videoId: string;
// }

// export const youtube = async (query: string): Promise<YouTubeVideo[]> => {
//   const apiKey = process.env.YOUTUBE_API_KEY;

//   // Validate API key
//   if (!apiKey) {
//     console.error('YouTube API key is missing');
//     return [];
//   }

//   try {
//     const youtube = google.youtube({
//       version: 'v3',
//       auth: apiKey,
//     });

//     const response = await youtube.search.list({
//       part: ['snippet'],
//       q: query,
//       type: 'video',
//       maxResults: 5,
//     });

//     // Safely process the response with type checking
//     const videos: YouTubeVideo[] = (response.data.items || [])
//       .filter((item): item is youtube_v3.Schema$SearchResult => 
//         !!item.snippet && !!item.id && !!item.id.videoId
//       )
//       .map((item) => ({
//         title: item.snippet!.title || 'Untitled',
//         thumbnailUrl: item.snippet!.thumbnails?.default?.url || '',
//         videoId: item.id!.videoId || '',
//       }));

//     return videos;

//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error('Error fetching videos:', error.message);
//     } else {
//       console.error('An unknown error occurred:', String(error));
//     }
//     return [];
//   }
// };

// // Example of usage with error handling
// async function searchVideos(query: string) {
//   try {
//     const videos = await youtube(query);
//     console.log('YouTube Videos:', videos);
//   } catch (error) {
//     console.error('Search failed:', error);
//   }
// }

// const fetchYouTubeVideos = async (query) => {
//     const apiKey = process.env.YOUTUBE_API_KEY; // Store the key securely
//     const baseURL = 'https://www.googleapis.com/youtube/v3/search';
    
//     const url = `${baseURL}?part=snippet&type=video&key=${apiKey}&q=${encodeURIComponent(query)}&maxResults=5`;
    
//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`YouTube API Error: ${response.statusText}`);
//       }
//       const data:unknown = await response.json();
//     //   return data.items;
//     console.log("data",data);
//     } catch (error) {
//       console.error('Error fetching YouTube videos:', error);
//       throw error;
//     }
//   };
  
//   // Usage Example
//   fetchYouTubeVideos('react').then(videos => {
//     console.log('Videos:', videos);
//   }).catch(error => {
//     console.error('Failed to fetch videos:', error);
//   });
  