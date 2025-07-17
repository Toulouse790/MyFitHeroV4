import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: string;
  uploadDate: string;
  url: string;
}

const AdminMedia: React.FC = () => {
  const [mediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      name: 'workout-banner.jpg',
      type: 'image',
      size: '2.5 MB',
      uploadDate: '2024-01-15',
      url: '/images/workout-banner.jpg'
    },
    {
      id: '2',
      name: 'exercise-demo.mp4',
      type: 'video',
      size: '15.2 MB',
      uploadDate: '2024-01-20',
      url: '/videos/exercise-demo.mp4'
    },
    {
      id: '3',
      name: 'nutrition-guide.pdf',
      type: 'document',
      size: '3.8 MB',
      uploadDate: '2024-01-25',
      url: '/documents/nutrition-guide.pdf'
    }
  ]);

  const getTypeIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return <Image size={16} className="text-blue-500" />;
      case 'video':
        return <Video size={16} className="text-purple-500" />;
      case 'document':
        return <FileText size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image size={20} />
            Media Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search media files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Upload size={16} className="mr-2" />
              Upload Media
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Upload Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaFiles.map((file) => (
                  <tr key={file.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getTypeColor(file.type)}>
                        {file.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-600">{file.size}</td>
                    <td className="p-3 text-gray-600">{file.uploadDate}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye size={14} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download size={14} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMedia;
