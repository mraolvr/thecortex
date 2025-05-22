import { useState } from 'react';
import GlowingEffect from '../../components/ui/GlowingEffect';
import { Image, FileText, Film, Music, Grid, List } from 'lucide-react';

// Sample data
const sampleMediaItems = [
  {
    id: '1',
    type: 'image',
    name: 'Project Screenshot.png',
    size: '2.4 MB',
    lastModified: '2024-03-15',
    thumbnail: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    type: 'document',
    name: 'Project Proposal.pdf',
    size: '1.2 MB',
    lastModified: '2024-03-14',
  },
  {
    id: '3',
    type: 'video',
    name: 'Demo Recording.mp4',
    size: '45.6 MB',
    lastModified: '2024-03-13',
    thumbnail: 'https://via.placeholder.com/150',
  },
  {
    id: '4',
    type: 'audio',
    name: 'Meeting Recording.mp3',
    size: '12.8 MB',
    lastModified: '2024-03-12',
  },
];

const getFileIcon = (type) => {
  switch (type) {
    case 'image':
      return <Image className="w-5 h-5" />;
    case 'document':
      return <FileText className="w-5 h-5" />;
    case 'video':
      return <Film className="w-5 h-5" />;
    case 'audio':
      return <Music className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

export default function MediaLibrary() {
  const [mediaItems] = useState(sampleMediaItems);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Media Library</h1>
          <p className="text-neutral">Manage and organize your media files</p>
        </div>

        <GlowingEffect className="bg-surface p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button className="text-primary hover:text-primary-light transition-colors">
                + Upload Files
              </button>
              <div className="h-4 w-px bg-neutral"></div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-background text-primary'
                      : 'text-neutral hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-background text-primary'
                      : 'text-neutral hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-background-light rounded-lg p-4 hover:bg-background-lighter transition-colors"
                >
                  {item.thumbnail ? (
                    <div className="aspect-square rounded-lg overflow-hidden mb-3">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-background flex items-center justify-center mb-3">
                      {getFileIcon(item.type)}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-neutral">{item.size}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-background-light rounded-lg hover:bg-background-lighter transition-colors"
                >
                  <div className="p-2 bg-background rounded-lg">
                    {getFileIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-neutral">{item.size}</p>
                  </div>
                  <p className="text-sm text-neutral">{item.lastModified}</p>
                </div>
              ))}
            </div>
          )}
        </GlowingEffect>
      </div>
    </div>
  );
} 